# Idealist

Functional HTTP micro-framework.

> npm install idealist

## Usage

See `example.js` for the complete working code

```js
//Our own way to handle Future errors, lifted into the Idealist world.
const attempt = App.liftf(Future.fold(S.Left, S.Right));
const errorToResponse = e => ({
  status: 500,
  headers: {},
  body: {message: e.val.message, name: e.val.name}
})

//Create the app
const app = App.empty()

  //Error handling
  .use(App.do(function*(next){
    const e = yield attempt(next);
    return S.either(errorToResponse, S.I, e);
  }))

  //We can just map over the monad and use the "headers" lens to modify the response headers
  .use(R.map(R.over(headers, R.assoc('X-Powered-By', 'Monads'))))

  //...or turn every response body into JSON
  .use(R.map(R.over(body, JSON.stringify)))

  //Use do-notation to create middleware
  .use(App.do(function*(next){
    const {config} = yield Idealist.get;
    const db = yield Idealist.lift(connectToDatabase(config.db));
    yield Idealist.modify(R.assoc('db', db));
    const res = yield next;
    yield Idealist.lift(closeDatabase(db));
    return res;
  }))

  //This endpoint simply ignores the "next" Monad
  .use(App.do(function*(){
    const {db} = yield Idealist.get;
    const user = yield Idealist.lift(findUser(db, 'bob'))
    return {status: 200, body: user, headers: {}};
  }))


App.mount(app, 3000, {
  db: 'mydb://username:password@localhost:1337/db'
});
```
