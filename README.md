xmlkit [![Build Status](https://travis-ci.org/lemonde/xmlkit.svg?branch=master)](https://travis-ci.org/salper/xmlkit) [![Dependency Status](https://david-dm.org/lemonde/xmlkit.svg)](https://david-dm.org/lemonde/xmlkit) [![devDependency Status](https://david-dm.org/lemonde/xmlkit/dev-status.svg)](https://david-dm.org/lemonde/xmlkit#info=devDependencies)
======

A lightweight toolkit to manipulate XML. It is not meant to replace [Cheerio](https://github.com/cheeriojs/cheerio), it is probably just a subset of it, without the jQuery like interface.

### Examples
```javascript
var kit = require('xmlkit');

/**
 * Instanciation
 */

kit('<text>An XML string</text>'); // Given a string
// => Kit

kit(htmlparser2.parseDOM('<text>An XML string</text>', { xmlMode: true })); // Given fb55/domhandler
// => Kit

kit(anotherKit); // Given another kit collection
// => Kit

/**
 * Properties
 */

kit('<text>An XML string</text>').dom;
// => fb55/domhandler

kit('<text>An XML string</text>').length;
// => 1

/**
 * Rendering
 */

kit('<text>An XML string</text>').innerXml;
// => 'An XML string'

kit('<text>An XML string</text>').outerXml;
// => '<text>An XML string</text>'

/**
 * Traversing.
 */

kit('<p>First</p><p>Second</p>').first.innerXml;
// => 'First'

kit('<p>First</p><p>Second</p>').last.innerXml;
// => 'Second'

kit('<p>First</p><p>Second</p>').get(0).innerXml;
// => 'First'

kit('<signature><author>Jake</author></signature>').find('signature > author').innerXml;
// => 'Jake'

kit('<ul><li>a</li><li>b</li></ul>').find('li').parent.outerXml;
// => '<ul><li>a</li><li>b</li></ul>'

kit('<ul><li>a</li><li>b</li></ul>').find('li').next.innerXml;
// => 'b'

kit('<ul><li>a</li><li>b</li></ul>').find('li:last-child').prev.innerXml;
// => 'a'

kit('<p>First</p><p>Second</p>').slice(0, 1).innerXml;
// => 'First'

kit('<b>First</b><i>Second</i>').filter(function (kit) {
  return kit.is('b');
}).innerXml;
// => 'First'

kit('<span>2</span><span>1</span><span>3</span>').sort(function (a, b) {
  return a.innerXml > b.innerXml ? 1 : (a.innerXml < b.innerXml ? -1 : 0);
}).outerXml;
// => '<span>1</span><span>2</span><span>3</span>'

kit('<p>1</p><span>2</span><p>3</p>').filter(function (kit) {
  return kit.is('p');
}).outerXml;
// => '<p>1</p><p>3</p>'

kit('<p>First</p><p>Second</p>').forEach(foo);
// => Kit

kit('<p>First</p><p>Second</p>').map(function (kit) {
  return kit.innerXml;
}).join(', ');
// => 'First, Second'

kit('<p>First</p><p>Second</p>').reduce(function (acc, kit) {
  return acc.concat([kit.innerXml]);
}, []).join(', ');
// => 'First, Second'

/**
 * Manipulating
 */

kit('<text id="foo"/>').attr.id;
// => 'foo'

(function () {
  var result = kit('<text id="foo"/>');
  return (result.attr.id = 'bar') && result;
})().outerXml;
// => '<text id="bar"/>'

kit('<p>a</p>').append('<p>b</p>').outerXml;
// => '<p>a</p><p>b</p>'

kit('<p>a</p>').prepend('<p>b</p>').outerXml;
// => '<p>b</p><p>a</p>'

kit('<p>First</p><p>Second</p>').remove('p').outerXml;
// => ''

kit('<p>First</p><p>Second</p>').clean('p').outerXml;
// => 'FirstSecond'

kit('<p>First</p><p>Second</p>').replace('p', '<span></span>').outerXml;
// => '<span></span><span></span>'

kit('<p>First</p><p>Second</p>').replace('p', '<span><placeholder/></span>').outerXml;
// => '<span>First</span><span>Second</span>'

/**
 * Other
 */

kit('<p>Paragraph</p>').is('p');
// => true

kit('<p>Paragraph</p>').clone();
// => Kit
```
