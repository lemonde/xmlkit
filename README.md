xmlkit [![Build Status](https://travis-ci.org/lemonde/xmlkit.svg?branch=master)](https://travis-ci.org/salper/xmlkit)
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

kit('<text>An XML string</text>').innerXml;
// => 'An XML string'

kit('<text>An XML string</text>').outerXml;
// => '<text>An XML string</text>'

kit('<p>First</p><p>Second</p>').first.innerXml;
// => 'First'

kit('<p>First</p><p>Second</p>').last.innerXml;
// => 'Second'

kit('<text id="some"/>').attr.id;
// => 'some'

/**
 * Methods.
 */

kit('<p>First</p><p>Second</p>').get(0).innerXml;
// => 'First'

kit('<p>Paragraph</p>').is('p');
// => true

kit('<signature><author>Jake</author></signature>').find('signature > author').innerXml;
// => 'Jake'

kit('<p>First</p><p>Second</p>').slice(0, 1).innerXml;
// => 'First'

kit('<b>First</b><i>Second</i>').filter(function (kit) {
  return kit.is('b');
}).innerXml;
// => 'First'

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

kit('<p>First</p><p>Second</p>').remove('p').innerXml;
// => ''

kit('<p>First</p><p>Second</p>').clean('p').innerXml;
// => 'FirstSecond'
```
