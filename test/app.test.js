'use strict';

const {expect} = require('chai');
const App = require('../lib/app');

const I = x => x;
const dec = x => x - 1;
const sqr = x => x * x;

const assertApp = x => {
  expect(x).to.be.a('function');
  expect(x).to.have.property('use');
  expect(x).to.have.property('concat');
};

describe('App', () => {

  describe('App()', () => {

    it('creates an App', () => {
      const actual = App([]);
      assertApp(actual);
    });

    it('creates a composition of given functions', () => {
      const app = App([sqr, dec]);
      expect(app(5)).to.equal(16);
    });

  });

  describe('.empty()', () => {

    it('creates an App', () => {
      const actual = App.empty();
      assertApp(actual);
    });

  });

  describe('#use()', () => {

    it('creates a new App', () => {
      const app = App.empty();
      const actual = app.use(I);
      expect(actual).to.not.equal(app);
      assertApp(actual);
    });

    it('composes arguments in reverse', () => {
      const app = App.empty().use(dec).use(sqr);
      const actual = app(5);
      expect(actual).to.equal(24);
    });

  });

});
