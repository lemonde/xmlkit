'use strict';

var _ = require('lodash');
var domUtils = require('htmlparser2').DomUtils;
var cssSelect = require('CSSselect');

/**
 * Module interface.
 */

module.exports = Kit;

/**
 * Kit collection.
 *
 * @param {[Object]|Object|[Kit]|Kit} dom
 */

function Kit(dom) {

  /**
   * @property {[Object]} dom - internal collection
   */

  def(this, 'dom', Array.isArray(dom) ? dom : [ dom ]);

  /**
   * @property {Number} length - length of the collection
   */

  def(this, 'length', function () {
    return this.dom.length;
  });

  /**
   * @property {String} innerXml - inner XML of the collection (concatenated)
   */

  def(this, 'innerXml', function () {
    return this.dom.map(domUtils.getInnerHTML).join('');
  });

  /**
   * @property {String} outerXml - outer XML of the collection (concatenated)
   */

  def(this, 'outerXml', function () {
    return this.dom.map(domUtils.getOuterHTML).join('');
  });

  /**
   * @property {Kit} first - first node wrapped in Kit
   */

  def(this, 'first', this.get.bind(this, 0));

  /**
   * @property {Kit} last - last node wrapped in Kit
   */

  def(this, 'last', this.get.bind(this, this.length - 1));

  /**
   * @property {Object} attr - first node attributes indirection
   */

  def(this, 'attr', function () {
    return this.dom[0].attribs || {};
  });
}

/**
 * Return a Kit of the node at the provided index.
 *
 * @param {Number} index
 * @return {Kit}
 */

Kit.prototype.get = function (index) {
  return new Kit(this.dom[index]);
};

/**
 * Return true if kit nodes accept given selector.
 *
 * @param {String} selector
 * @return {Boolean}
 */

Kit.prototype.is = function (selector) {
  return cssSelect.is(this.dom[0], selector, { xmlMode: true });
};

/**
 * Return a Kit of the collection found with
 * the provided selector.
 *
 * @param {String} selector - a CSS selector
 * @return {Kit}
 * @see CSSselect
 */

Kit.prototype.find = function (selector) {
  return new Kit(cssSelect(selector, this.dom, { xmlMode: true }));
};

/**
 * Array.prototype.slice interface.
 *
 * @return {Kit}
 */

Kit.prototype.slice = function () {
  return new Kit(this.dom.slice.apply(this.dom, arguments));
};

/**
 */

Kit.prototype.filter = function () {
  var nodes = this.dom.filter.apply(this.dom.map(function (node) {
    return new Kit(node);
  }), arguments);

  return new Kit(_(nodes).pluck('dom').flatten().value());
};

/**
 */

Kit.prototype.forEach = function () {
  this.dom.forEach.apply(this.dom.map(function (node) {
    return new Kit(node);
  }), arguments);
  return this;
};


/**
 */

Kit.prototype.map = function () {
  return this.dom.map.apply(this.dom.map(function (node) {
    return new Kit(node);
  }), arguments);
};

/**
 * Array.prototype.reduce interface.
 *
 * @return {*}
 */

Kit.prototype.reduce = function (fn) {
  return this.dom.reduce.apply(this.dom, [function (acc, node) {
    return fn.apply(this, [acc, new Kit(node)].concat([].slice.call(arguments, 1)));
  }].concat([].slice.call(arguments, 1)));
};

/**
 */

Kit.prototype.remove = function (kit) {
  if (! (kit instanceof Kit)) return this.remove(this.find(kit));

  kit.dom.forEach(domUtils.removeElement);
  return this;
};

/**
 */

Kit.prototype.clean = function (kit) {
  if (! (kit instanceof Kit)) return this.clean(this.find(kit));

  kit.dom.forEach(function (node) {
    domUtils.removeElement(node);

    var index = this.dom.indexOf(node);
    if (index > -1) this.dom.splice.apply(this.dom, [index, 1].concat(node.children));

    if (node.prev) {
      (node.children || [].reverse).forEach(function (child) {
        domUtils.append(node.prev, child);
      });
    } else if (node.next) {
      (node.children || []).forEach(function (child) {
        domUtils.prepend(node.prev, child);
      });
    } else if (node.parent) {
      (node.children || []).forEach(function (child) {
        domUtils.appendChild(node.parent, child);
      });
    } else {
      (node.children || []).forEach(function (child) {
        domUtils.replaceElement(node, child);
      });
    }
  }, this);

  return this;
};

/**
 * Clone the kit object.
 *
 * @return {Kit}
 */

Kit.prototype.clone = function () {
  return require('./factory')(this.outerXml);
};

/**
 * Object.defineProperty helper.
 *
 * @param {Object} target
 * @param {String} name
 * @param {*} value
 */

function def(target, name, value) {
  Object.defineProperty(target, name, _.extend(
    { enumerable: true },
    _.isFunction(value) ? { get: value } : { value: value }
  ));
}