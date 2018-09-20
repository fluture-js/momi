import {expect} from 'chai';

import App from '../lib/app';

function I(x) { return x; }
function dec(x) { return x - 1; }
function sqr(x) { return x * x; }
function assertApp(x) {
  expect (x).to.be.a ('function');
  expect (x).to.have.property ('use');
  expect (x).to.have.property ('concat');
}

describe ('App', function() {

  describe ('App()', function() {

    it ('creates an App', function() {
      var actual = App ([]);
      assertApp (actual);
    });

    it ('creates a composition of given functions', function() {
      var app = App ([sqr, dec]);
      expect (app (5)).to.equal (16);
    });

  });

  describe ('.empty()', function() {

    it ('creates an App', function() {
      var actual = App.empty ();
      assertApp (actual);
    });

  });

  describe ('#use()', function() {

    it ('creates a new App', function() {
      var app = App.empty ();
      var actual = app.use (I);
      expect (actual).to.not.equal (app);
      assertApp (actual);
    });

    it ('composes arguments in reverse', function() {
      var app = App.empty ().use (dec).use (sqr);
      var actual = app (5);
      expect (actual).to.equal (24);
    });

  });

});
