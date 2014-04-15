'use strict';

var _ = require('lodash');
var _s = require('underscore.string');
var fs = require('fs');
var path = require('path');
var expect = require('chai').expect;
var factory = require('../lib/factory');

describe('kit', function () {
  var kit;

  describe('given no XML', function () {
    beforeEach(function () {
      kit = factory();
    });

    it('should render inner XML', function () {
      expect(kit).to.have.property('innerXml').to.be.empty;
    });

    it('should render outer XML', function () {
      expect(kit).to.have.property('outerXml').to.be.empty;
    });
  });

  describe('given empty XML', function () {
    beforeEach(function () {
      kit = factory('');
    });

    it('should render inner XML', function () {
      expect(kit).to.have.property('innerXml').to.be.empty;
    });

    it('should render outer XML', function () {
      expect(kit).to.have.property('outerXml').to.be.empty;
    });
  });

  describe('given XML', function () {
    var xml;

    before(function () {
      xml = fs.readFileSync(path.join(__dirname, 'fixture.xml'));
    });

    beforeEach(function () {
      kit = factory(xml);
    });

    it('should render inner XML', function () {
      expect(kit.innerXml.trim()).to.satisfy(function (text) {
        return _s.startsWith(text, '<book id="bk101">') &&
               _s.endsWith(text, 'environment.</description>\n   </book>');
      });
    });

    it('should render outer XML', function () {
      expect(kit.outerXml.trim()).to.satisfy(function (text) {
        return _s.startsWith(text, '<?xml version="1.0"?>\n<catalog>') &&
               _s.endsWith(text, '</book>\n</catalog>');
      });
    });

    it('should find nodes', function () {
      expect(kit.find('book')).to.have.length(12);
      expect(kit.find('book:first-child').innerXml.trim()).to.satisfy(function (text) {
        return _s.startsWith(text, '<author>Gambardella') &&
               _s.endsWith(text, 'with XML.</description>');
      });
    });

    it('should get first node', function () {
      expect(kit.find('book').first.innerXml.trim()).to.satisfy(function (text) {
        return _s.startsWith(text, '<author>Gambardella') &&
               _s.endsWith(text, 'with XML.</description>');
      });
    });

    it('should get last node', function () {
      expect(kit.find('book').last.innerXml.trim()).to.satisfy(function (text) {
        return _s.startsWith(text, '<author>Galos') &&
               _s.endsWith(text, 'environment.</description>');
      });
    });

    it('should get nth node', function () {
      expect(kit.find('book').get(1).innerXml.trim()).to.satisfy(function (text) {
        return _s.startsWith(text, '<author>Ralls') &&
               _s.endsWith(text, 'of the world.</description>');
      });
    });

    it('should get parent node', function () {
      expect(kit.find('author')).to.have.deep.property('parent.attr.id', 'bk101');
    });

    it('should get previous node', function () {
      expect(kit.find('book').get(1)).to.have.deep.property('prev.prev.attr.id', 'bk101');
    });

    it('should get next node', function () {
      expect(kit.find('book')).to.have.deep.property('next.next.attr.id', 'bk102');
    });

    it('shouls slice nodes', function () {
      expect(kit.find('book').slice(1, 2).innerXml.trim()).to.satisfy(function (text) {
        return _s.startsWith(text, '<author>Ralls') &&
               _s.endsWith(text, 'of the world.</description>');
      });
    });

    it('shouls sort nodes', function () {
      function sortBook(a, b) {
        return a.attr.id > b.attr.id ? -1 : (a.attr.id < b.attr.id ? 1 : 0);
      }

      expect(kit.find('book').sort(sortBook)).to.have.deep.property('attr.id', 'bk112');
    });

    it('should filter nodes', function () {
      var filteredKit = kit.find('catalog, book').filter(function (kit) {
        return kit.is('book');
      });

      expect(filteredKit).to.have.length(12);
      expect(filteredKit.outerXml.trim()).to.satisfy(function (text) {
        return _s.startsWith(text, '<book id="bk101">') &&
               _s.endsWith(text, 'environment.</description>\n   </book>');
      });
    });

    it('should iterate on nodes', function () {
      var tags = [];
      kit.find('author').forEach(function (kit) {
        tags.push(kit.innerXml);
      });

      expect(tags).to.eql([
        'Gambardella, Matthew',
        'Ralls, Kim',
        'Corets, Eva',
        'Corets, Eva',
        'Corets, Eva',
        'Randall, Cynthia',
        'Thurman, Paula',
        'Knorr, Stefan',
        'Kress, Peter',
        'O\'Brien, Tim',
        'O\'Brien, Tim',
        'Galos, Mike'
      ]);
    });

    it('should map nodes', function () {
      expect(kit.find('author').map(_.property('innerXml'))).to.eql([
        'Gambardella, Matthew',
        'Ralls, Kim',
        'Corets, Eva',
        'Corets, Eva',
        'Corets, Eva',
        'Randall, Cynthia',
        'Thurman, Paula',
        'Knorr, Stefan',
        'Kress, Peter',
        'O\'Brien, Tim',
        'O\'Brien, Tim',
        'Galos, Mike'
      ]);
    });

    it('should reduce nodes', function () {
      var tags = kit.find('author').reduce(function (tags, kit) {
        return tags.concat([kit.innerXml]);
      }, []);

      expect(tags).to.eql([
        'Gambardella, Matthew',
        'Ralls, Kim',
        'Corets, Eva',
        'Corets, Eva',
        'Corets, Eva',
        'Randall, Cynthia',
        'Thurman, Paula',
        'Knorr, Stefan',
        'Kress, Peter',
        'O\'Brien, Tim',
        'O\'Brien, Tim',
        'Galos, Mike'
      ]);
    });

    it('should remove nodes', function () {
      expect(
        kit.find('book:first-child')
        .remove('title, genre, price, publish_date, description')
        .innerXml.trim()
      ).to.equal('<author>Gambardella, Matthew</author>');
    });

    it('should clean nodes', function () {
      expect(kit.find('book:first-child author').clean('author').outerXml.trim())
      .to.equal('Gambardella, Matthew');
    });
  });
});