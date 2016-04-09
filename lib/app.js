const http = require('http');
const S = require('sanctuary');
const State = require('fantasy-states');
const Future = require('fluture');
const Free = require('freeky/free').Free;

const ResSpec = x => x;
const unionMaps = (m1, m2) => new Map(Array.from(m1.entries()).concat(Array.from(m2.entries())));
const dispatch = interpreters => command => interpreters.get(command.constructor)(command);

const mapErrToRes = function(err, res){
  res.writeHead(500, {'Content-Type': 'text/plain'});
  res.end('Internal Server Error\n', 'utf8');
}

const mapValToRes = function(spec, res){
  res.writeHead(spec.status, spec.headers);
  res.end(spec.body, 'utf8');
}

const App = function(wares, interpreters){

  const use = ware => App([ware].concat(wares), interpreters);

  const install = (Monad, interpreter) =>
    App(wares, unionMaps(new Map([[Monad, interpreter]]), interpreters));

  const concat = app =>
    App(wares, unionMaps(app.interpreters, interpreters));

  return Object.assign(S.pipe(wares), {
    interpreters, use, install, concat, empty: App.empty
  });

};

const SF = State.StateT(Future);

App.Free = Free;
App.Future = Future;
App.StateFuture = SF;

App.empty = () => App([], new Map);

App.mount = (app, port, config) => {
  const tree = app(Free.of(ResSpec({status: 404, body: 'Not Found\n', headers: {}})));
  const interpretation = tree.foldMap(dispatch(app.interpreters), SF.of);
  return http.createServer((req, res) => {
    interpretation.run({req, config}).fork(
      err => mapErrToRes(err, res),
      val => mapValToRes(val._1, res)
    );
  }).listen(port);
}

module.exports = App;
