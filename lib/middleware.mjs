import State from 'fantasy-states';
import Future from 'fluture';

function Tuple2(_1, _2) { return {_1: _1, _2: _2}; }

var Middleware = State.StateT (Future);

// TEMP: Patch hoist until https://github.com/fantasyland/fantasy-states/pull/2 lands
Middleware.hoist = function(f) {
  return function(m) {
    return Middleware (function(s) {
      return f (m.evalState (s)).map (function(x) { return Tuple2 (x, s); });
    });
  };
};

//         reject :: b -> Middleware a b c
Middleware.reject = function(x) {
  return Middleware.lift (Future.reject (x));
};

//         fromComputation :: ((a -> (), b -> ()) -> () -> ()) -> Middleware s a b
Middleware.fromComputation = function(f) {
  return Middleware.lift (Future (f));
};

export default Middleware;
