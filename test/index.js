import Z from 'sanctuary-type-classes';
import assert from 'assert';
import {compose} from 'monastic/index.js';
import test from 'oletus';
import {resolve, reject as rejectF} from 'fluture/index.js';
import {equivalence} from 'fluture/test/assertions.js';

import {
  reject,
  fromComputation,
  go,
  connect,
  evalState,
  run,
  modify,
} from '../index.js';

function eq(a) {
  return function(b) {
    return assert.deepStrictEqual (a, b);
  };
}

function mul3(x) { return 3 * x; }

function K(x) { return function() { return x; }; }
function R(f) { return function() { return f (new Error ()); }; }

function middleware(x) {
  return function(a) {
    return Z.map (K (x), a);
  };
}

function response(spec, done) {
  return {
    writeHead: function(status, headers) {
      eq (spec.status) (status);
      eq (spec.headers) (headers);
    },
    end: function(body) {
      eq (spec.body) (body);
      done ();
    },
  };
}

test ('.run', () => equivalence (run (middleware (42), 2)) (resolve (42)));

test ('.reject', () => equivalence (evalState (null) (reject (42))) (rejectF (42)));

test ('.fromComputation with a resolved future', () => {
  const actual = evalState (null) (fromComputation ((rej, res) => {
    res (42);
    return () => null;
  }));
  return equivalence (actual) (resolve (42));
});

test ('.fromComputation with a rejected future', () => {
  const actual = evalState (null) (fromComputation (rej => {
    rej (42);
    return () => null;
  }));
  return equivalence (actual) (rejectF (42));
});

test ('.connect with a resolution in the middleware', () => new Promise (((res, rej) => {
    const expected = {
      status: 200,
      headers: {'Content-Type': 'none'},
      body: 'empty',
    };
    const m = connect (middleware (expected));
    m (null, response (expected, res), R (rej));
  })));

test ('.connect with a rejection in the middleware', () => new Promise ((res => {
    const m = connect (K (reject (42)));
    m (null, {}, e => {
      eq (42) (e);
      res ();
    });
  })));

test ('.connect with an invalid middleware', () => {
  assert.throws (
    () => { connect (K (32)); },
    /Your app does not return a Middleware/
  );
});

test ('.go', () => {
  const app = compose (go (function* (next) { yield modify (mul3); return yield next; }))
                      (go (function* (next) { yield next; yield modify (eq (6)); return 42; }));
  return equivalence (run (app, 2)) (resolve (42));
});
