# Idealist

Functional HTTP micro-framework.

> npm install idealist

## Usage

See `example.js` for the complete working code

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
