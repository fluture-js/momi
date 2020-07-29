//. # momi
//.
//. **Mo**nadic **Mi**ddleware
//.
//. > `npm install --save monastic fluture momi`
//.
//. Middleware - specifically in the case of Connect, Express and Koa - is a
//. mechanism which encodes several effects:
//.
//. - **A build-up of state** through mutation of the `req` parameter
//. - **An eventual response** through mutation of the `res` parameter
//. - **Inversion of control** over the continuation by means of calling the
//.   `next` parameter
//. - **Possible error branch** by means of calling the `next` parameter with
//.   a value
//.
//. If we would want to encode all of these effects into a data-structure, we
//. could use a `StateT(Future) -> StateT(Future)` structure:
//.
//. - **A build-up of state** through the `State` monad
//. - **An eventual response** through the right-sided value of `Future`
//. - **Inversion of control** by passing the whole structure into a function
//. - **Possible error branch** through the left-sided value of `Future`
//.
//. In other words, the `StateT(Future)`-structure might be considered the
//. Middleware monad. This packages exposes the Middleware monad, comprised of
//. `State` from [monastic][] and `Future` from [Fluture][]. Besides the
//. monad itself, it also exposes some utility functions and structures for
//. practically applying Middleware. One such utility is the `App` class,
//. which allows composition of functions over Middleware to be written more
//. like what you are used to from middleware as it comes with Express or Koa.
//.
//. ## Usage
//.
//. ```js
//. import Z from 'sanctuary-type-classes';
//. import qs from 'querystring';
//.
//. import {compose, constant} from 'monastic/index.js';
//. import {go, mount, get, put} from 'momi';
//.
//. const queryParseMiddleware = go (function* (next) {
//.   const req = yield get;
//.   const query = qs.parse (req.url.split ('?')[1]);
//.   yield put (Object.assign ({query}, req));
//.   return yield next;
//. });
//.
//. const echoMiddleware = Z.map (req => ({
//.   status: 200,
//.   headers: {'X-Powered-By': 'momi'},
//.   body: req.query.echo,
//. }), get);
//.
//. const app = compose (
//.   queryParseMiddleware,
//.   constant (echoMiddleware)
//. );
//.
//. mount (app, 3000);
//. ```
//.
//. ## Examples
//.
//. - **[Readme][example-1]** the code from [Usage](#usage), ready to run.
//. - **[Express][example-2]** shows how to embed Momi within Express.
//. - **[Bootstrap][example-3]** an example showing application structure.
//. - **[Real World][example-4]** how momi is being used in real life.

import {Future, fork, reject as rejectF} from 'fluture/index.js';
import {StateT} from 'monastic/index.js';
import http from 'http';
import Z from 'sanctuary-type-classes';

export const Middleware = StateT (Future);

// reject :: b -> Middleware a b c
export function reject(x) {
  return Middleware.lift (rejectF (x));
}

// fromComputation :: ((a -> (), b -> ()) -> () -> ()) -> Middleware s a b
export function fromComputation(f) {
  return Middleware.lift (Future (f));
}

export const get = Middleware.get;
export const modify = Middleware.modify;
export const put = Middleware.put;
export const evalState = Middleware.evalState;
export const execState = Middleware.execState;
export const lift = Middleware.lift;
export const hoist = Middleware.hoist;

function mapErrToRes(err, res) {
  res.writeHead (500, {'Content-Type': 'text/plain'});
  console.error(err.stack || String(err)); //eslint-disable-line
  res.end ('Internal Server Error\n', 'utf8');
}

function mapValToRes(spec, res) {
  res.writeHead (spec.status, spec.headers);
  res.end (spec.body, 'utf8');
}

const notFoundMiddleware = Z.of (Middleware, {
  status: 404,
  body: 'Not Found\n',
  headers: {'Content-Type': 'text/plain'},
});

function evaluateApp(app) {
  const monad = app (notFoundMiddleware);

  if (monad instanceof Middleware) {
    return monad;
  }

  throw new TypeError ('Your app does not return a Middleware');
}

export function go(f) {
  return function(m) {
    return Z.chain (() => {
      const g = f (m);
      function next(x) {
        const o = g.next (x);
        return o.done ? Z.of (Middleware, o.value) : Z.chain (next, o.value);
      }

      return next ();
    }, Z.of (Middleware));
  };
}

export function connect(app) {
  const monad = evaluateApp (app);

  return function(req, res, next) {
    return fork (next)
                (val => mapValToRes (val, res))
                (evalState (req) (monad));
  };
}

export function mount(app, port) {
  const monad = evaluateApp (app);
  return http.createServer ((req, res) => {
    fork (err => mapErrToRes (err, res))
         (val => mapValToRes (val, res))
         (evalState (req) (monad));
  }).listen (port);
}

export function run(app, initial) {
  return evalState (initial) (app (Z.of (Middleware, null)));
}

//. [monastic]: https://github.com/dicearr/monastic
//. [Fluture]: https://github.com/fluture-js/Fluture
//. [example-1]: https://github.com/fluture-js/momi/tree/master/examples/readme
//. [example-2]: https://github.com/fluture-js/momi/tree/master/examples/express
//. [example-3]: https://github.com/fluture-js/momi/tree/master/examples/bootstrap
//. [example-4]: https://github.com/Avaq/node-server-skeleton/tree/master/src/bootstrap
