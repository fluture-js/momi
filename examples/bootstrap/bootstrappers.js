import {go, put, lift, modify, mount, get} from '../../index.js';
import {getService, putService} from './util.js';
import Z from 'sanctuary-type-classes';
import R from 'ramda';
import {log} from 'util';
import Future, {node, attempt} from 'fluture/index.js';
import config from 'config';
import mysql from 'mysql';

import myApp from './app.js';

const K = x => _ => x;
const B = (f, g) => x => f (g (x));

//    Services :: StrMap String Any
const Services = () => ({});

// This bootstrapper prepares the state to be used by the functions in ./util.
//      serviceBootstrapper :: Middleware a b c -> Middleware {services: Services} b c
export const serviceBootstrapper = go (function*(next) {
  yield put ({services: Services ()});
  return yield next;
});

// This bootstrapper registers a config service which loads application
// settings.
//      configurationBootstrapper :: Middleware {services: Services} b c
//                                -> Middleware {services: Services} Error c
export const configurationBootstrapper = go (function*(next) {
  yield putService ('config', prop => attempt (_ => config.get (prop)));
  return yield next;
});

// This bootstrapper sets up a mysqlPool for the duration of the app life.
//      databasePoolBootstrapper :: Middleware {services: Services} Error c
//                               -> Middleware {services: Services} Error c
export const databasePoolBootstrapper = go (function*(next) {
  log ('Creating mysql pool');
  const config = yield getService ('config');
  const settings = yield lift (config ('mysql'));
  const pool = mysql.createPool (settings);
  yield putService ('mysqlPool', pool);
  log ('Created mysql pool');
  const res = yield next;
  log ('Closing mysql pool');
  yield lift (node (done => pool.end (done)));
  log ('Closed mysql pool');
  return res;
});

// This bootstrapper sets up an HTTP server for the duration of the app life.
// It also prepends a single middleware which will carry the services created
// for this app over to the app loaded from ./app.
//      httpServerBootstrapper :: Middleware {services: Services} Error c
//                             -> Middleware {services: Services} Error c
export const httpServerBootstrapper = go (function*(next) {
  log ('Connecting HTTP server');
  const state = yield get;
  const mergeState = next => Z.chain (
    K (next),
    modify (req => R.merge (state, {req}))
  );
  const app = B (mergeState, myApp);
  const connections = new Set ();
  const server = mount (app, 3000);
  server.on ('connection', connection => {
    connection.once ('close', _ => connections.delete (connection));
    connections.add (connection);
  });
  log ('Connected HTTP server');
  const res = yield next;
  log ('Disconnecting HTTP server');
  yield lift (node (done => {
    connections.forEach (connection => connection.destroy ());
    server.close (done);
  }));
  log ('Disconnected HTTP server');
  return res;
});

// This bootstrapper keeps the app alive until a SIGINT is received.
//      resolveOnSigintBootstrapper :: Middleware {services: Services} Error c
//                                  -> Middleware {services: Services} Error ()
export const resolveOnSigintBootstrapper = _ =>
  lift (Future ((rej, res) => {
    process.once ('SIGINT', res);
    return () => null;
  }));
