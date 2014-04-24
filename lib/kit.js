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
   * @property {Kit} parent - first node parent wrapped in Kit
   */

  def(this, 'parent', function () {
    return factory((this.dom[0] || {}).parent);
  });

  /**
   * @property {Kit} children - first node children wrapped in Kit
   */

  def(this, 'children', function () {
    return factory((this.dom[0] || {}).children);
  });

  /**
   * @property {Kit} prev - first node prev sibling wrapped in Kit
   */

  def(this, 'prev', function () {
    return factory((this.dom[0] || {}).prev);
  });

  /**
   * @property {Kit} next - first node next sibling wrapped in Kit
   */

  def(this, 'next', function () {
    return factory((this.dom[0] || {}).next);
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
    return (this.dom[0] || {}).attribs || {};
  }, function (value) {
      /*jshint boss:true */
    return ((this.dom[0] || {}).attribs = value);
  });
}

/**
 * Return a Kit of the node at the provided index.
 *
 * @param {Number} index
 * @return {Kit}
 */

Kit.prototype.get = function (index) {
  return factory(this.dom[index]);
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
  return factory(cssSelect(selector, this.dom, { xmlMode: true }));
};

/**
 * Array.prototype.slice interface.
 *
 * @return {Kit}
 */

Kit.prototype.slice = function () {
  return factory(this.dom.slice.apply(this.dom, arguments));
};

/**
 * Array.prototype.sort interface.
 *
 * @return {Kit}
 */

Kit.prototype.sort = function () {
  var nodes = this.dom.sort.apply(this.dom.map(factory), arguments);
  return factory(_(nodes).pluck('dom').flatten().value());
};

/**
 * Array.prototype.filter interface.
 *
 * @return {Kit}
 */

Kit.prototype.filter = function () {
  var nodes = this.dom.filter.apply(this.dom.map(factory), arguments);
  return factory(_(nodes).pluck('dom').flatten().value());
};

/**
 * Array.prototype.forEach interface.
 *
 * @return {Kit}
 */

Kit.prototype.forEach = function () {
  this.dom.forEach.apply(this.dom.map(factory), arguments);
  return this;
};


/**
 * Array.protoype.map interface.
 *
 * @return {Array}
 */

Kit.prototype.map = function () {
  return this.dom.map.apply(this.dom.map(factory), arguments);
};

/**
 * Array.prototype.reduce interface.
 *
 * @return {*}
 */

Kit.prototype.reduce = function (fn) {
  return this.dom.reduce.apply(this.dom, [function (acc, node) {
    return fn.apply(this, [acc, factory(node)].concat([].slice.call(arguments, 2)));
  }].concat([].slice.call(arguments, 1)));
};

/**
 * Append provided Kit|String to each node in the collection.
 *
 * @param {Kit|String} kit
 * @return {Kit}
 */

Kit.prototype.append = function (kit) {
  this.dom.forEach(function (kit, node) {
    kit.clone().dom.forEach(domUtils.append.bind(domUtils, node));
  }.bind(this, factory(kit)));
  return this;
};

/**
 * Prepend provided Kit|String to each node in the collection.
 *
 * @param {Kit|String} kit
 * @return {Kit}
 */

Kit.prototype.prepend = function (kit) {
  this.dom.forEach(function (kit, node) {
    kit.clone().dom.forEach(domUtils.prepend.bind(domUtils, node));
  }.bind(this, factory(kit)));
  return this;
};

/**
 * Remove nodes identified by the provided
 * Kit|selector.
 *
 * @param {Kit|String} kit
 *
 * @return {Kit}
 */

Kit.prototype.remove = function (kit) {
  return this.replace(kit);
};

/**
 * Remove nodes identified by the provided
 * Kit|selector, but keep the children.
 *
 * @param {Kit|String} kit
 * @return {Kit}
 */

Kit.prototype.clean = function (kit) {
  return this.replace(kit, '<placeholder/>');
};

/**
 * Replace nodes identified by the provided source
 * using the given destination.
 *
 * @param {Kit|String} src
 * @param {Kit|String} dst
 * @return {Kit}
 */

Kit.prototype.replace = function (src, dst) {
  ((src instanceof Kit) ? src : this.find(src)).forEach(function (dst, src) {
    replaceAndSplice(this, src, dst);
  }.bind(this, factory(dst)));
  return this;
};

/**
 * Replace and splice helper.
 *
 * If the source is a direct entry of the provided kit,
 * it needs to be removed from it.
 *
 * @param {Kit} kit
 * @param {Kit} src
 * @param {Kit} dst
 * @return {Kit}
 */

function replaceAndSplice(kit, src, dst) {
  var index = kit.dom.indexOf(src.dom[0]);
  var nodes = replace(src, dst.clone());
  if (index > -1) kit.dom.splice.apply(kit.dom, [index, 1].concat(nodes.dom));
  return kit;
}

/**
 * Replace helper.
 *
 * If the destination is empty, source is removed.
 * Also, replace each placeholder in destination by
 * the source children.
 */

function replace(src, dst) {
  if (! dst.length) return domUtils.removeElement(src.dom[0]) || dst;

  domUtils.replaceElement(src.dom[0], dst.dom[0]);
  dst.first.append(dst.slice(1));

  // Looking for placeholders to replace by children.
  dst.find('placeholder').forEach(function (placeholder) {
    var index = dst.dom.indexOf(placeholder.dom[0]);
    var nodes = replace(placeholder, src.children.clone());
    if (index > -1) dst.dom.splice.apply(dst.dom, [index, 1].concat(nodes.dom));
  });

  return dst;
}

/**
 * Clone the Kit object.
 *
 * @return {Kit}
 */

Kit.prototype.clone = function () {
  return factory(this.outerXml);
};

/**
 * Kit factory helper.
 *
 * @param {*} dom
 * @return {Kit}
 */

function factory(kit) {
  return (kit instanceof Kit) ? kit : require('./factory')(kit);
}

/**
 * Object.defineProperty helper.
 *
 * @param {Object} target
 * @param {String} name
 * @param {*} getter
 * @param {Function} setter
 */

function def(target, name, getter, setter) {
  Object.defineProperty(target, name, _.extend(
    { enumerable: true },
    _.isFunction(getter) ? { get: getter } : { value: getter },
    _.isFunction(setter) ? { set: setter } : {}
  ));
}