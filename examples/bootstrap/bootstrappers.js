'use strict';

const {App, Middleware} = require('../../');
const {getService, putService} = require('./util');
const {merge} = require('ramda');
const {log} = require('util');
const Future = require('fluture');

const K = x => _ => x;
const B = (f, g) => x => f(g(x));

//    Services :: StrMap String Any
const Services = () => ({});

//This bootstrapper prepares the state to be used by the functions in ./util.
//      serviceBootstrapper :: Middleware a b c -> Middleware {services: Services} b c
exports.serviceBootstrapper = App.do(function*(next) {
  yield Middleware.put({services: Services()});
  return yield next;
});

//This bootstrapper registers a config service which loads application settings.
//      configurationBootstrapper :: Middleware {services: Services} b c
//                                -> Middleware {services: Services} Error c
exports.configurationBootstrapper = App.do(function*(next) {
  const config = require('config');
  yield putService('config', prop => Future.try(_ => config.get(prop)));
  return yield next;
});

//This bootstrapper sets up a mysqlPool for the duration of the app life.
//      databasePoolBootstrapper :: Middleware {services: Services} Error c
//                               -> Middleware {services: Services} Error c
exports.databasePoolBootstrapper = App.do(function*(next) {
  log('Creating mysql pool');
  const mysql = require('mysql');
  const config = yield getService('config');
  const settings = yield Middleware.lift(config('mysql'));
  const pool = mysql.createPool(settings);
  yield putService('mysqlPool', pool);
  log('Created mysql pool');
  const res = yield next;
  log('Closing mysql pool');
  yield Middleware.lift(Future.node(done => pool.end(done)));
  log('Closed mysql pool');
  return res;
});

//This bootstrapper sets up an HTTP server for the duration of the app life.
//It also prepends a single middleware which will carry the services created
//for this app over to the app loaded from ./app.
//      httpServerBootstrapper :: Middleware {services: Services} Error c
//                             -> Middleware {services: Services} Error c
exports.httpServerBootstrapper = App.do(function*(next) {
  log('Connecting HTTP server');
  const state = yield Middleware.get;
  const mergeState = next => Middleware.modify(req => merge(state, {req})).chain(K(next));
  const app = B(mergeState, require('./app'));
  const connections = new Set;
  const server = App.mount(app, 3000);
  server.on('connection', connection => {
    connection.once('close', _ => connections.delete(connection));
    connections.add(connection);
  });
  log('Connected HTTP server');
  const res = yield next;
  log('Disconnecting HTTP server');
  yield Middleware.lift(Future.node(done => {
    connections.forEach(connection => connection.destroy());
    server.close(done);
  }));
  log('Disconnected HTTP server');
  return res;
});

//This bootstrapper keeps the app alive until a SIGINT is received.
//      resolveOnSigintBootstrapper :: Middleware {services: Services} Error c
//                                  -> Middleware {services: Services} Error ()
exports.resolveOnSigintBootstrapper = _ =>
  Middleware.lift(Future((rej, res) => void process.once('SIGINT', res)));
