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
 * Array.prototype[filter|forEach|map] interface.
 */

['filter', 'forEach', 'map'].forEach(function (name) {
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