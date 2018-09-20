import http from 'http';

import Middleware from './middleware';

function identity(x) { return x; }

function compose(f, g) {
  return function(x) { return f (g (x)); };
}

function pipe(fs) { return fs.reduce (compose, identity); }

function mapErrToRes(err, res) {
  res.writeHead (500, {'Content-Type': 'text/plain'});
  console.error(err.stack || String(err)); //eslint-disable-line
  res.end ('Internal Server Error\n', 'utf8');
}

function mapValToRes(spec, res) {
  res.writeHead (spec.status, spec.headers);
  res.end (spec.body, 'utf8');
}

var notFoundMiddleware = Middleware.of ({status: 404,
body: 'Not Found\n',
headers: {
  'Content-Type': 'text/plain'
}});

function evaluateApp(app) {
  var monad = app (notFoundMiddleware);

  if (monad instanceof Middleware) {
    return monad;
  }

  throw new TypeError ('Your app does not return a Middleware');
}

function App(wares) {
  function use(ware) { return App (wares.concat ([ware])); }
  function concat(app) { return App (app.wares.concat (wares)); }
  return Object.assign (pipe (wares), {use: use, concat: concat});
}

App.empty = function() { return App ([]); };

App.do = function(f) {
  return function(m) {
    return Middleware.of ().chain (function() {
      var g = f (m);
      function next(x) {
        var o = g.next (x);
        return o.done ? Middleware.of (o.value) : o.value.chain (next);
      }

      return next ();
    });
  };
};

App.mount = function(app, port) {
  var monad = evaluateApp (app);
  return http.createServer (function(req, res) {
    monad.evalState (req).fork (
      function(err) { return mapErrToRes (err, res); },
      function(val) { return mapValToRes (val, res); }
    );
  }).listen (port);
};

App.connect = function(app) {
  var monad = evaluateApp (app);

  return function(req, res, next) {
    return monad.evalState (req)
      .fork (next, function(val) { return mapValToRes (val, res); });
  };
};

//  run :: (Middleware a b () -> Middleware c b d) -> a -> Future b d
App.run = function(app, initial) {
  return app (Middleware.of (null)).evalState (initial);
};

export default App;
