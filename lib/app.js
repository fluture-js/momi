'use strict';

const http = require('http');
const State = require('fantasy-states');
const Future = require('fluture');

const identity = x => x;
const compose = (f, g) => x => f(g(x));
const pipe = fs => fs.reduce(compose, identity);

const mapErrToRes = (err, res) => {
  res.writeHead(500, {'Content-Type': 'text/plain'});
  console.error(err.stack || String(err)); //eslint-disable-line
  res.end('Internal Server Error\n', 'utf8');
};

const mapValToRes = (spec, res) => {
  res.writeHead(spec.status, spec.headers);
  res.end(spec.body, 'utf8');
};

const Middleware = State.StateT(Future);

const notFoundMiddleware = Middleware.of({status: 404, body: 'Not Found\n', headers: {
  'Content-Type': 'text/plain'
}});

const evaluateApp = app => {
  const monad = app(notFoundMiddleware);
  if(monad instanceof Middleware) {
    return monad;
  }
  throw new TypeError('Your app does not return a Middleware');
};

const App = wares => {
  const use = ware => App(wares.concat([ware]));
  const concat = app => App(app.wares.concat(wares));
  return Object.assign(pipe(wares), {use, concat});
};

App.empty = () => App([]);

App.do = f => m => Middleware.of().chain(() => {
  const g = f(m);
  const next = x => {
    const o = g.next(x);
    return o.done ? Middleware.of(o.value) : o.value.chain(next);
  };
  return next();
});

const Tuple2 = (_1, _2) => ({_1, _2});
App.liftf = f => m => Middleware(s => f(m.evalState(s)).map(x => Tuple2(x, s)));

App.mount = (app, port) => {
  const monad = evaluateApp(app);
  return http.createServer((req, res) => {
    monad.evalState(req).fork(
      err => mapErrToRes(err, res),
      val => mapValToRes(val, res)
    );
  }).listen(port);
};

module.exports = {App, State, Future, Middleware};
