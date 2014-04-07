'use strict';

var parseDom = require('htmlparser2').parseDOM;
var domUtils = require('htmlparser2').DomUtils;
var cssSelect = require('CSSselect');

/**
 * Module interface.
 */

exports.parse = parse;
exports.Kit = Kit;

/**
 * Parse provided XML and returns a Kit.
 *
 * @param {String|Buffer} xml
 * @return {Kit}
 * @see htmlparser2.parseDOM
 */

function parse(xml) {
  return new Kit(parseDom(xml || '', { xmlMode: true }));
}

/**
 * Kit collection.
 *
 * @param {[Object]|Object|[Kit]|Kit} dom
 */

function Kit(dom) {

  /**
   * @property {[Object]} dom - internal collection
   */

  Object.defineProperty(this, 'dom', {
    enumerable: true,
    value: sanitizeDom()
  });

  /**
   * Internal collection sanitizer.
   * Flatten DOM of Kit instances.
   *
   * @return [Object]
   */

  function sanitizeDom() {
    return ! dom ? [] : (Array.isArray(dom) ? dom : [dom])
    .map(function (node) {
      return node instanceof Kit ? node.dom : [node];
    })
    .reduce(function (acc, nodes) {
      return acc.concat(nodes);
    }, []);
  }

  /**
   * @property {Number} length - length of the collection
   */

  Object.defineProperty(this, 'length', {
    enumerable: true,
    get: function () {
      return this.dom.length;
    }
  });

  /**
   * @property {String} innerXml - inner XML of the collection (concatenated)
   */

  Object.defineProperty(this, 'innerXml', {
    enumerable: true,
    get: function () {
      return this.dom.map(domUtils.getInnerHTML).join('');
    }
  });

  /**
   * @property {String} outerXml - outer XML of the collection (concatenated)
   */

  Object.defineProperty(this, 'outerXml', {
    enumerable: true,
    get: function () {
      return this.dom.map(domUtils.getOuterHTML).join('');
    }
  });

  /**
   * @property {Kit} first - first node wrapped in Kit
   */

  Object.defineProperty(this, 'first', {
    enumerable: true,
    get: function () {
      return this.get(0);
    }
  });

  /**
   * @property {Kit} last - last node wrapped in Kit
   */

  Object.defineProperty(this, 'last', {
    enumerable: true,
    get: function () {
      return this.get(this.length - 1);
    }
  });

  /**
   * @property {Object} attr - first node attributes indirection
   */

  Object.defineProperty(this, 'attr', {
    enumerable: true,
    get: function () {
      return this.dom[0].attribs || {};
    }
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
 * Array.prototype[forEach|map] interface.
 */

[ 'forEach', 'map' ].forEach(function (name) {
  Kit.prototype[name] = function (fn) {
    return this.dom[name].apply(this.dom, [function (node) {
      return fn.apply(this, [new Kit(node)].concat([].slice.call(arguments, 1)));
    }].concat([].slice.call(arguments, 1)));
  };
});

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