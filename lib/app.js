'use strict';

const http = require('http');
const Middleware = require('./middleware');

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

const App = module.exports = wares => {
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

App.mount = (app, port) => {
  const monad = evaluateApp(app);
  return http.createServer((req, res) => {
    monad.evalState(req).fork(
      err => mapErrToRes(err, res),
      val => mapValToRes(val, res)
    );
  }).listen(port);
};

App.connect = app => {
  const monad = evaluateApp(app);
  return (req, res, next) => monad.evalState(req).fork(next, val => mapValToRes(val, res));
};

//  run :: (Middleware a b () -> Middleware c b d) -> a -> Future b d
App.run = (app, initial) => app(Middleware.of(null)).evalState(initial);
