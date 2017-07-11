'use strict';

const {App, Middleware} = require('../../');
const {prop, assoc} = require('ramda');
const {getService, putService} = require('./util');
const createError = require('http-errors');
const qs = require('querystring');
const Future = require('fluture');

const REQ = Middleware.get.map(prop('req'));
const QUERY = Middleware.get.map(prop('query'));
const error = (code, message) => Middleware.lift(Future.reject(createError(code, message)));

const No = x => ({ok: false, value: x});
const Yes = x => ({ok: true, value: x});
const attempt = Middleware.hoist(Future.fold(No, Yes));

const errorToResponse = e => ({
  status: e.status || 500,
  headers: {},
  body: JSON.stringify({message: e.message, name: e.name})
});

//Export an app.
module.exports = App.empty()

//Error handling middleware.
.use(App.do(function*(next) {
  const res = yield attempt(next);
  return res.ok ? res.value : errorToResponse(res.value);
}))

//Query-string parsing middleware.
.use(App.do(function*(next) {
  const req = yield REQ;
  const query = qs.parse(req.url.split('?')[1]);
  yield Middleware.modify(assoc('query', query));
  return yield next;
}))

//Database connection middleware using the mysqlPool service created by a bootstrapper.
//:: Middleware {req: Request, services: Services} b c
//-> Middleware {req: Request, services: Services} Error c
.use(App.do(function*(next) {
  const mysqlPool = yield getService('mysqlPool');
  const connection = yield Middleware.lift(Future.node(done => mysqlPool.getConnection(done)));
  yield putService('connection', connection);
  const res = yield next;
  connection.release();
  return res;
}))

//Endpoint retrieving something from the database.
//:: Middleware {req: Request, services: Services} Error c
//-> Middleware {req: Request, services: Services} Error ResponseSpecification
.use(App.do(function*() {
  const query = yield QUERY;

  if(!query.id) {
    yield error(400, 'Missing "id" parameter');
  }

  const connection = yield getService('connection');
  const users = yield Middleware.lift(Future.node(done =>
    connection.query('SELECT * FROM users WHERE id = ?', [query.id], done)
  ));
  const user = users[0];

  if(!user) {
    yield error(404, 'User not found');
  }

  return {status: 200, body: JSON.stringify(user), headers: []};
}));
