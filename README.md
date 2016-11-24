# momi

**Mo**nadic **Mi**ddleware

> npm install momi

Middleware - specifically in the case of Connect, Express and Koa - is a
mechanism which encodes several effects:

- **A build-up of state** through mutation of the `req` parameter
- **An eventual response** through mutation of the `res` parameter
- **Inversion of control** over the continuation by means of calling the `next` parameter
- **Possible error branch** by means of calling the `next` parameter with a value

If we would want to encode all of these effects into a data-structure, we would
end up with a `StateT(Future)`:

- **A build-up of state** through `State.modify`
- **An eventual response** through the right-sided value of `Future`
- **Inversion of control** By running raw (not lifted) functions over the structure
- **Possible error branch** through the left-sided value of `Future`

In other words, the `StateT(Future)`-structure might be considered the
Middleware monad. This packages exposes the Middleware monad, comprised of
`State` from [fantasy-states][] and `Future` from [Fluture][]. Besides the
monad itself, it also exposes some utility functions and structures for
practically applying Middleware. One such structure is the `App` structure,
which allows composition of functions over Middleware to be written more like
what you are used to from middleware as it comes with Connect, Express or Koa.

## Usage

See `examples/readme/index.js` for the complete working code

```js
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
```

[fantasy-states]: https://github.com/fantasyland/fantasy-states
[Fluture]: https://github.com/Avaq/Fluture
