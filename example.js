'use strict';

const App = require('.');
const R = require('ramda');
const S = require('sanctuary');
const {Middleware, Future} = App;
const {log} = require('util');

const headers = R.lensProp('headers');
const body = R.lensProp('body');

const connectToDatabase = c => Future.after(300, {'@@type': 'database', c});
const closeDatabase = c => Future.after(50, `Database ${c.c} closed`).map(log);
const findUser = (db, name) => Future.after(50, db['@@type'] === 'database' && name === 'bob'
  ? {name: 'bob'}
  : null
);

//Our own way to handle Future errors, lifted into the Idealist world.
const attempt = App.liftf(Future.fold(S.Left, S.Right));
const errorToResponse = e => ({
  status: 500,
  headers: {},
  body: {message: e.message, name: e.name}
});

//Create the app
const app = App.empty()

  //Error handling
  .use(App.do(function*(next) {
    const e = yield attempt(next);
    return S.either(errorToResponse, S.I, e);
  }))

  //We can just map over the monad and use the "headers" lens to modify the response headers
  .use(R.map(R.over(headers, R.assoc('X-Powered-By', 'Monads'))))

  //...or turn every response body into JSON
  .use(R.map(R.over(body, JSON.stringify)))

  //Use do-notation to create middleware
  .use(App.do(function*(next) {
    const {config} = yield Middleware.get;
    const db = yield Middleware.lift(connectToDatabase(config.db));
    yield Middleware.modify(R.assoc('db', db));
    const res = yield next;
    yield Middleware.lift(closeDatabase(db));
    return res;
  }))

  //This endpoint simply ignores the "next" Monad
  .use(App.do(function*() {
    const {db} = yield Middleware.get;
    const user = yield Middleware.lift(findUser(db, 'bob'));
    return {status: 200, body: user, headers: {}};
  }));


App.mount(app, 3000, {
  db: 'mydb://username:password@localhost:1337/db'
});
