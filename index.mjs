import Future from 'fluture';
import {StateT} from 'monastic';
import http from 'http';
import Z from 'sanctuary-type-classes';

export var Middleware = StateT (Future);

// reject :: b -> Middleware a b c
export function reject(x) {
  return Middleware.lift (Future.reject (x));
}

// fromComputation :: ((a -> (), b -> ()) -> () -> ()) -> Middleware s a b
export function fromComputation(f) {
  return Middleware.lift (Future (f));
}

export var get = Middleware.get;
export var modify = Middleware.modify;
export var put = Middleware.put;
export var evalState = Middleware.evalState;
export var execState = Middleware.execState;
export var lift = Middleware.lift;
export var hoist = Middleware.hoist;

function mapErrToRes(err, res) {
  res.writeHead (500, {'Content-Type': 'text/plain'});
  console.error(err.stack || String(err)); //eslint-disable-line
  res.end ('Internal Server Error\n', 'utf8');
}

function mapValToRes(spec, res) {
  res.writeHead (spec.status, spec.headers);
  res.end (spec.body, 'utf8');
}

var notFoundMiddleware = Z.of (Middleware, {
  status: 404,
  body: 'Not Found\n',
  headers: {'Content-Type': 'text/plain'}
});

function evaluateApp(app) {
  var monad = app (notFoundMiddleware);

  if (monad instanceof Middleware) {
    return monad;
  }

  throw new TypeError ('Your app does not return a Middleware');
}

export function go(f) {
  return function(m) {
    return Z.chain (function() {
      var g = f (m);
      function next(x) {
        var o = g.next (x);
        return o.done ? Z.of (Middleware, o.value) : Z.chain (next, o.value);
      }

      return next ();
    }, Z.of (Middleware));
  };
}

export function connect(app) {
  var monad = evaluateApp (app);

  return function(req, res, next) {
    return evalState (req) (monad)
      .fork (next, function(val) { return mapValToRes (val, res); });
  };
}

export function mount(app, port) {
  var monad = evaluateApp (app);
  return http.createServer (function(req, res) {
    evalState (req) (monad).fork (
      function(err) { return mapErrToRes (err, res); },
      function(val) { return mapValToRes (val, res); }
    );
  }).listen (port);
}

export function run(app, initial) {
  return evalState (initial) (app (Z.of (Middleware, null)));
}
