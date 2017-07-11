'use strict';

var expect = require('chai').expect;
var App = require('../lib/app');
var I = function(x) { return x; };
var dec = function(x) { return x - 1; };
var sqr = function(x) { return x * x; };
var assertApp = function(x) {
  expect(x).to.be.a('function');
  expect(x).to.have.property('use');
  expect(x).to.have.property('concat');
};

describe('App', function() {

  describe('App()', function() {

    it('creates an App', function() {
      var actual = App([]);
      assertApp(actual);
    });

    it('creates a composition of given functions', function() {
      var app = App([sqr, dec]);
      expect(app(5)).to.equal(16);
    });

  });

  describe('.empty()', function() {

    it('creates an App', function() {
      var actual = App.empty();
      assertApp(actual);
    });

  });

  describe('#use()', function() {

    it('creates a new App', function() {
      var app = App.empty();
      var actual = app.use(I);
      expect(actual).to.not.equal(app);
      assertApp(actual);
    });

    it('composes arguments in reverse', function() {
      var app = App.empty().use(dec).use(sqr);
      var actual = app(5);
      expect(actual).to.equal(24);
    });

  });

});
