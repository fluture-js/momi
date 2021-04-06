# momi

**Mo**nadic **Mi**ddleware

> `npm install --save monastic fluture momi`

Middleware - specifically in the case of Connect, Express and Koa - is a
mechanism which encodes several effects:

- **A build-up of state** through mutation of the `req` parameter
- **An eventual response** through mutation of the `res` parameter
- **Inversion of control** over the continuation by means of calling the
  `next` parameter
- **Possible error branch** by means of calling the `next` parameter with
  a value

If we would want to encode all of these effects into a data-structure, we
could use a `StateT(Future) -> StateT(Future)` structure:

- **A build-up of state** through the `State` monad
- **An eventual response** through the right-sided value of `Future`
- **Inversion of control** by passing the whole structure into a function
- **Possible error branch** through the left-sided value of `Future`

In other words, the `StateT(Future)`-structure might be considered the
Middleware monad. This packages exposes the Middleware monad, comprised of
`State` from [monastic][] and `Future` from [Fluture][]. Besides the
monad itself, it also exposes some utility functions and structures for
practically applying Middleware. One such utility is the `App` class,
which allows composition of functions over Middleware to be written more
like what you are used to from middleware as it comes with Express or Koa.

## Usage

### Node

```console
$ npm install --save momi
```

On Node 12 and up, this module can be loaded directly with `import` or
`require`. On Node versions below 12, `require` or the [esm][]-loader can
be used.

### Deno and Modern Browsers

You can load the EcmaScript module from various content delivery networks:

- [Skypack](https://cdn.skypack.dev/momi@1.0.0)
- [JSPM](https://jspm.dev/momi@1.0.0)
- [jsDelivr](https://cdn.jsdelivr.net/npm/momi@1.0.0/+esm)

### Old Browsers and Code Pens

There's a [UMD][] file included in the NPM package, also available via
jsDelivr: https://cdn.jsdelivr.net/npm/momi@1.0.0/dist/umd.js

This file adds `momi` to the global scope, or use CommonJS/AMD
when available.

## Usage Example

```js
import Z from 'sanctuary-type-classes';
import qs from 'querystring';
import http from 'http';

import {compose, constant} from 'monastic';
import {go, mount, get, put} from 'momi';

const queryParseMiddleware = go (function* (next) {
  const req = yield get;
  const query = qs.parse (req.url.split ('?')[1]);
  yield put (Object.assign ({query}, req));
  return yield next;
});

const echoMiddleware = Z.map (req => ({
  status: 200,
  headers: {'X-Powered-By': 'momi'},
  body: req.query.echo,
}), get);

const app = compose (
  queryParseMiddleware,
  constant (echoMiddleware)
);

mount (http, app, 3000);
```

## Examples

- **[Readme][example-1]** the code from [Usage](#usage), ready to run.
- **[Express][example-2]** shows how to embed Momi within Express.
- **[Bootstrap][example-3]** an example showing application structure.
- **[Real World][example-4]** how momi is being used in real life.

[monastic]: https://github.com/dicearr/monastic
[Fluture]: https://github.com/fluture-js/Fluture
[example-1]: https://github.com/fluture-js/momi/tree/master/examples/readme
[example-2]: https://github.com/fluture-js/momi/tree/master/examples/express
[example-3]: https://github.com/fluture-js/momi/tree/master/examples/bootstrap
[example-4]: https://github.com/Avaq/node-server-skeleton/tree/master/src/bootstrap
[esm]: https://github.com/standard-things/esm
[UMD]: https://github.com/umdjs/umd
