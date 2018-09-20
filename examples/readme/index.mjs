import {App, Middleware} from '../../';
import qs from 'querystring';

const queryParseMiddleware = App.do(function*(next) {
  const req = yield Middleware.get;
  const query = qs.parse(req.url.split('?')[1]);
  yield Middleware.put(Object.assign({query}, req));
  return yield next;
});

const echoMiddleware = Middleware.get.map(req => ({
  status: 200,
  headers: {'X-Powered-By': 'momi'},
  body: req.query.echo
}));

const app = App.empty()
.use(queryParseMiddleware)
.use(_ => echoMiddleware);

App.mount(app, 3000);
