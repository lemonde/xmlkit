'use strict';

var Kit = require('../lib/kit');
var expect = require('chai').expect;
var factory = require('../lib/factory');
var parseDom = require('htmlparser2').parseDOM;
var getOuterHtml = require('htmlparser2').DomUtils.getOuterHTML;

describe('factory', function () {
  var kit;

  describe('given no argument', function () {
    beforeEach(function () {
      kit = factory();
    });

    it('should return empty kit', function () {
      expect(kit).to.be.instanceOf(Kit);
      expect(kit).to.have.length(0);
    });
  });

  describe('given null argument', function () {
    beforeEach(function () {
      kit = factory(null);
    });

    it('should return empty kit', function () {
      expect(kit).to.be.instanceOf(Kit);
      expect(kit).to.have.length(0);
    });
  });

  describe('given string argument', function () {
    beforeEach(function () {
      kit = factory('<a>test</a>');
    });

    it('should return a kit', function () {
      expect(kit).to.be.instanceOf(Kit);
      expect(kit).to.have.length(1);
      expect(getOuterHtml(kit.dom[0])).to.equal('<a>test</a>');
    });
  });

  describe('given kit object', function () {
    beforeEach(function () {
      kit = factory(factory('<a>test</a>'));
    });

    it('should return a kit', function () {
      expect(kit).to.be.instanceOf(Kit);
      expect(kit).to.have.length(1);
      expect(getOuterHtml(kit.dom[0])).to.equal('<a>test</a>');
    });
  });

  describe('given htmlparser DOM', function () {
    beforeEach(function () {
      kit = factory(parseDom('<a>test</a>', { xmlMode: true }));
    });

    it('should return a kit', function () {
      expect(kit).to.be.instanceOf(Kit);
      expect(kit).to.have.length(1);
      expect(getOuterHtml(kit.dom[0])).to.equal('<a>test</a>');
    });
  });

  describe('given mixed data', function () {
    beforeEach(function () {
      kit = factory([
        '<a>test1</a>',
        null,
        factory('<a>test2</a>'),
        undefined,
      ].concat(parseDom('<a>test3</a>', { xmlMode: true })));
    });

    it('should return a kit', function () {
      expect(kit).to.be.instanceOf(Kit);
      expect(kit).to.have.length(3);
      expect(kit.dom.map(getOuterHtml).join('')).to.equal('<a>test1</a><a>test2</a><a>test3</a>');
    });
  });
});