'use strict';

var _ = require('lodash');
var Kit = require('./kit');
var parseDom = require('htmlparser2').parseDOM;

/**
 * Module interface.
 */

module.exports = factory;

/**
 * Kit factory.
 *
 * @param {*} data
 * @return {Kit}
 * @see htmlparser2.parseDOM
 */

function factory(data) {
  if (isString(data)) return new Kit(parseDom(data, { xmlMode: true }));
  if (isKit(data)) return data;
  return new Kit(sanitizeData(data));
}

/**
 * Return true if provided data is
 * a buffer or a string.
 *
 * @param {*} data
 * @return {Boolean}
 */

function isString(data) {
  return _.isString(data) || data instanceof Buffer;
}

/**
 * Extract dom from Kit objects if necessary,
 * and flatten those.
 *
 * @param {*} data
 * @return {[*]}
 */

function sanitizeData(data) {
  return _.chain(Array.isArray(data) ? data : [ data ])
  .map(function (node) {
    return isString(node) ? factory(node) : node;
  })
  .map(function (node) {
    return isKit(node) ? node.dom : node;
  })
  .flatten()
  .filter(isDomHandlerNode)
  .value();
}

/**
 * Return true if provided data look
 * like htmlparser2.DomHandler node.
 *
 * @param {*} data
 * @return {Boolean}
 */

function isDomHandlerNode(data) {
  if (Array.isArray(data)) return data.every(isDomHandlerNode);
  return data &&  [ 'type', 'name', 'attribs', 'children' ].every(_.partial(_.has, data));
}

/**
 * Return true if provided data is a Kit object.
 *
 * @param {*} data
 * @return {Boolean}
 */

function isKit(data) {
  return data instanceof Kit;
}