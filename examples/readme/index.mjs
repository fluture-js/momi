import Z from 'sanctuary-type-classes';
import {compose, constant} from 'monastic';

import qs from 'querystring';

import {go, mount, get, put} from '../../';

const queryParseMiddleware = go(function*(next) {
  const req = yield get;
  const query = qs.parse(req.url.split('?')[1]);
  yield put(Object.assign({query}, req));
  return yield next;
});

const echoMiddleware = Z.map(req => ({
  status: 200,
  headers: {'X-Powered-By': 'momi'},
  body: req.query.echo
}), get);

const app = compose(
  queryParseMiddleware,
  constant(echoMiddleware)
);

mount(app, 3000);
