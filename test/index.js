import Z from 'sanctuary-type-classes';
import assert from 'assert';
import {compose} from 'monastic/index.js';
import test from 'oletus';

import {
  reject,
  fromComputation,
  go,
  connect,
  evalState,
  run,
  modify,
} from '../index.js';

function isDeepStrictEqual(a, b) {
  try {
    assert.deepStrictEqual (a, b);
    return true;
  } catch (e) {
    return false;
  }
}

function assertion(expectedValue, actualValue, expectedBranch, actualBranch) {
  return new assert.AssertionError ({
    expected: expectedValue,
    actual: actualValue,
    message: (
      `Expected the Future to ${expectedBranch} with ${expectedValue} ` +
      `instead ${actualBranch} with ${actualValue}.`
    ),
  });
}

function assertRejected(m, x) {
  return new Promise (((res, rej) => {
    m.forkCatch (rej, y => {
      if (isDeepStrictEqual (x, y)) {
        res ();
      } else {
        rej (assertion (x, y, 'reject', 'reject'));
      }
    }, y => {
      rej (assertion (x, y, 'reject', 'resolve'));
    });
  }));
}

function assertResolved(m, x) {
  return new Promise (((res, rej) => {
    m.forkCatch (rej, y => {
      rej (assertion (x, y, 'resolve', 'reject'));
    }, y => {
      if (isDeepStrictEqual (x, y)) {
        res ();
      } else {
        rej (assertion (x, y, 'resolve', 'resolve'));
      }
    });
  }));
}

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

test ('.run', () => assertResolved (run (middleware (42), 2), 42));

test ('.reject', () => assertRejected (evalState (null) (reject (42)), 42));

test ('.fromComputation with a resolved future', () => {
  const actual = evalState (null) (fromComputation ((rej, res) => {
    res (42);
  }));
  return assertResolved (actual, 42);
});

test ('.fromComputation with a rejected future', () => {
  const actual = evalState (null) (fromComputation (rej => {
    rej (42);
  }));
  return assertRejected (actual, 42);
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
  return assertResolved (run (app, 2), 42);
});
