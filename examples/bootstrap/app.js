import R from 'ramda';
import Z from 'sanctuary-type-classes';
import createError from 'http-errors';
import qs from 'querystring';

import {coalesce, reject, node} from 'fluture/index.js';
import {get, lift, hoist, go, modify} from '../../index.js';
import {getService, putService} from './util.js';

const REQ = Z.map (R.prop ('req'), get);
const QUERY = Z.map (R.prop ('query'), get);
const error = (code, message) => lift (
  reject (createError (code, message))
);

const No = x => ({ok: false, value: x});
const Yes = x => ({ok: true, value: x});
const attempt = m => hoist (m)(coalesce (No) (Yes));

const errorToResponse = e => ({
  status: e.status || 500,
  headers: {},
  body: JSON.stringify ({message: e.message, name: e.name})
});

// Export an app.
export default R.compose (
  // Error handling middleware.
  go (function*(next) {
    const res = yield attempt (next);
    return res.ok ? res.value : errorToResponse (res.value);
  }),

  // Query-string parsing middleware.
  go (function*(next) {
    const req = yield REQ;
    const query = qs.parse (req.url.split ('?')[1]);
    yield modify (R.assoc ('query', query));
    return yield next;
  }),

  // Database connection middleware using the mysqlPool service created by a
  // bootstrapper.
  // :: Middleware {req: Request, services: Services} b c
  // -> Middleware {req: Request, services: Services} Error c
  go (function*(next) {
    const mysqlPool = yield getService ('mysqlPool');
    const connection = yield lift (
      node (done => mysqlPool.getConnection (done))
    );
    yield putService ('connection', connection);
    const res = yield next;
    connection.release ();
    return res;
  }),

  // Endpoint retrieving something from the database.
  // :: Middleware {req: Request, services: Services} Error c
  // -> Middleware {req: Request, services: Services} Error ResponseSpecification
  go (function*() {
    const query = yield QUERY;

    if (!query.id) {
      yield error (400, 'Missing "id" parameter');
    }

    const connection = yield getService ('connection');
    const users = yield lift (node (done =>
      connection.query ('SELECT * FROM users WHERE id = ?', [query.id], done)
    ));
    const user = users[0];

    if (!user) {
      yield error (404, 'User not found');
    }

    return {status: 200, body: JSON.stringify (user), headers: []};
  })
);
