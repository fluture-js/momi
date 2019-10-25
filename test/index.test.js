import Z from 'sanctuary-type-classes';
import assert from 'assert';
import {compose} from 'monastic';

import {
  reject,
  fromComputation,
  go,
  connect,
  evalState,
  run,
  modify
} from '..';

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
    )
  });
}

function assertRejected(m, x) {
  return new Promise (function(res, rej) {
    m.forkCatch (rej, function(y) {
      if (isDeepStrictEqual (x, y)) {
        res ();
      } else {
        rej (assertion (x, y, 'reject', 'reject'));
      }
    }, function(y) {
      rej (assertion (x, y, 'reject', 'resolve'));
    });
  });
}

function assertResolved(m, x) {
  return new Promise (function(res, rej) {
    m.forkCatch (rej, function(y) {
      rej (assertion (x, y, 'resolve', 'reject'));
    }, function(y) {
      if (isDeepStrictEqual (x, y)) {
        res ();
      } else {
        rej (assertion (x, y, 'resolve', 'resolve'));
      }
    });
  });
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

function res(spec, done) {
  return {
    writeHead: function(status, headers) {
      eq (spec.status) (status);
      eq (spec.headers) (headers);
    },
    end: function(body) {
      eq (spec.body) (body);
      done ();
    }
  };
}

suite ('Momi', function() {

  test ('.run', function() {
    return assertResolved (run (middleware (42), 2), 42);
  });

  test ('.reject', function() {
    return assertRejected (evalState (null) (reject (42)), 42);
  });

  suite ('.fromComputation', function() {
    test ('with a resolved future', function() {
      var actual = evalState (null) (fromComputation (function(rej, res) {
        res (42);
      }));
      return assertResolved (actual, 42);
    });
    test ('with a rejected future', function() {
      var actual = evalState (null) (fromComputation (function(rej) {
        rej (42);
      }));
      return assertRejected (actual, 42);
    });
  });

  suite ('.connect', function() {
    test ('with a resolution in the middleware', function(done) {
      var expected = {
        status: 200,
        headers: {'Content-Type': 'none'},
        body: 'empty'
      };
      var m = connect (middleware (expected));
      m (null, res (expected, done), R (done));
    });
    test ('with a rejection in the middleware', function(done) {
      var m = connect (K (reject (42)));
      m (null, {}, function(e) {
        eq (42) (e);
        done ();
      });
    });
    test ('with an invalid middleware', function() {
      assert.throws (
        function() { connect (K (32)); },
        /Your app does not return a Middleware/
      );
    });
  });

  test ('.go', function() {
    var app = compose (go (function*(next) {
      yield modify (mul3);
      return yield next;
    })) (go (function*(next) {
      yield next;
      yield modify (eq (6));
      return 42;
    }));
    return assertResolved (run (app, 2), 42);
  });

});
