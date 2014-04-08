'use strict';

var fs = require('fs');
var path = require('path');
var expect = require('chai').expect;
var xmlkit = require('../lib');

describe('XMLKit', function () {
  var kit;

  describe('given no xml', function () {
    beforeEach(function () {
      kit = xmlkit();
    });

    it('should return empty kit', function () {
      expect(kit).to.have.length(0);
    });
  });

  describe('given empty xml', function () {
    beforeEach(function () {
      kit = xmlkit('');
    });

    it('should return nothing', function () {
      expect(kit).to.have.length(0);
    });
  });

  describe('given text only', function () {
    beforeEach(function () {
      kit = xmlkit('test');
    });

    it('should find nothing', function () {
      expect(kit.find('*')).to.have.length(0);
    });

    it('should not display inner XML', function () {
      expect(kit).to.have.property('innerXml', '');
    });

    it('should display outer XML', function () {
      expect(kit).to.have.property('outerXml', 'test');
    });
  });

  describe('given tags', function () {
    beforeEach(function () {
      kit = xmlkit(fs.readFileSync(path.join(__dirname, './fixture.xml')));
    });

    it('should find elements', function () {
      expect(kit.find('catalog')).to.have.length(1);
      expect(kit.find('catalog > book')).to.have.length(12);
    });

    it('should get attributes', function () {
      expect(kit.find('catalog > book')).to.have.deep.property('first.attr.id', 'bk101');
      expect(kit.find('catalog > book')).to.have.deep.property('last.attr.id', 'bk112');
    });

    it('should be iterable using forEach', function () {
      var result = [];
      kit.find('catalog > book').forEach(function (kit) { result.push(kit.attr.id); });

      expect(result).to.eql([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(function (index) {
        return 'bk1' + ('0' + index).slice(-2);
      }));
    });

    it('should be iterable using map', function () {
      expect(kit.find('catalog > book').map(function (kit) { return kit.attr.id; }))
      .to.eql([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(function (index) {
        return 'bk1' + ('0' + index).slice(-2);
      }));
    });

    it('should be iterable using reduce', function () {
      expect(kit.find('catalog > book').reduce(function (result, kit) {
        return result.concat([kit.attr.id]);
      }, [])).to.eql([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(function (index) {
        return 'bk1' + ('0' + index).slice(-2);
      }));
    });

    it('should display inner XML', function () {
      expect(kit.find('catalog > book:first-child > author')).to.have.property(
        'innerXml', 'Gambardella, Matthew'
      );

      var nodes = xmlkit(kit.find('catalog > book').slice(0, 2).map(function (kit) {
        return kit.find('author');
      }));
      expect(nodes).to.have.property('innerXml', 'Gambardella, MatthewRalls, Kim');
    });

    it('should display outer XML', function () {
      expect(kit.find('catalog > book:first-child > author')).to.have.property(
        'outerXml', '<author>Gambardella, Matthew</author>'
      );

      var nodes = xmlkit(kit.find('catalog > book').slice(0, 2).map(function (kit) {
        return kit.find('author');
      }));
      expect(nodes).to.have.property('outerXml').that.equal(
        '<author>Gambardella, Matthew</author>' +
        '<author>Ralls, Kim</author>'
      );
    });
  });
});