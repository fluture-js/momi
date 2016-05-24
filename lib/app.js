const http = require('http');
const State = require('fantasy-states');
const Future = require('fluture');

const identity = x => x;
const compose = (f, g) => x => f(g(x));
const pipe = fs => fs.reduce(compose, identity);

const mapErrToRes = (err, res) => {
  res.writeHead(500, {'Content-Type': 'text/plain'});
  console.error(err.status || String(err));
  res.end('Internal Server Error\n', 'utf8');
}

const mapValToRes = (spec, res) => {
  res.writeHead(spec.status, spec.headers);
  res.end(spec.body, 'utf8');
}

const App = wares => {
  const use = ware => App(wares.concat([ware]));
  const concat = app => App(app.wares.concat(wares));
  return Object.assign(pipe(wares), {use, concat, empty: App.empty});
};

const Idealist = State.StateT(Future);

App.Future = Future;
App.State = State;
App.Idealist = Idealist;

App.empty = () => App([]);

App.do = f => m => Idealist.of().chain(() => {
  const g = f(m);
  const next = x => {
    const o = g.next(x);
    return o.done ? Idealist.of(o.value) : o.value.chain(next);
  };
  return next();
});

const Tuple2 = (_1, _2) => ({_1, _2});
App.liftf = f => m => Idealist(s => f(m.evalState(s)).map(x => Tuple2(x, s)))

App.mount = (app, port, config) => {
  const monad = app(Idealist.of({status: 404, body: 'Not Found\n', headers: {}}));
  return http.createServer((req, res) => {
    monad.evalState({req, config}).fork(
      err => mapErrToRes(err, res),
      val => mapValToRes(val, res)
    );
  }).listen(port);
}

module.exports = App;
