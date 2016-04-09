# Idealist

Functional HTTP micro-framework.

## Usage

```js
//Import dependencies.
const App = require('idealist');
const R = require('ramda');

//Import some Free Moands we'd like to use.
const FreeState = require('freeky/state');

//Some lenses to work with the Response structure.
const headers = R.lensProp('headers');
const body = R.lensProp('body');
const status = R.lensProp('status');

//Create an empty App.
const app = App.empty()

//We can just map over the monad and use the "headers" lens to modify the response headers
.use(R.map(R.over(headers, R.assoc('X-Powered-By', 'Monads'))))

//We can install our own interpreter, which must return a StateFuture.
.install(FreeState, m => App.StateFuture(state => {
  const x = m.run(state);
  return App.Future.of({_0: x[0], _1: x[1]});
}))

//And now we can use it!
.use(next => FreeState.get.chain(state => {
  console.log('The request URL is', state.req.url);
  console.log('The database config is', state.config.db);
  return next; //chain the "next" monad
}))

//We can plain ignore the input Monad and return our own. This is like not calling "next"
.use(_ => App.Free.of({status: 200, body: 'wut?', headers: {}}))

//Set the status and body by using lenses
.use(R.map(R.pipe(
  R.set(status, 200),
  R.set(body, 'Secret sauce!')
)));

//The returned app instance is also "middleware".
//Note that we must first "concat" to join the interpreters of both apps.
const actualApp = App.empty().concat(app).use(app);

//All we're doing is chaining over Free Monads, so we could write our middleware like:
const middleware = next => Monad.do(function*(){
  const {req} = yield FreeState.get;
  console.log('Request to ', req.url, 'started at ', Date.now())
  const res = yield next;
  console.log('Request finished at', Date.now())
  return res;
}, Free.of);

//Middleware are pure compsable functions which compose in reverse, so we could:
actualApp.use(pipe(middleware, middleware, middleware));

//Mounts an app on the specified port. The third argument will appear on the
//request state as "config".
App.mount(actualApp, 3000, {
  db: 'mydb://username:password@localhost:1337/db'
});
```
