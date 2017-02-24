'use strict';

const State = require('fantasy-states');
const Future = require('fluture');

const Tuple2 = (_1, _2) => ({_1, _2});

const Middleware = State.StateT(Future);

//TEMP: Patch hoist until https://github.com/fantasyland/fantasy-states/pull/2 lands
Middleware.hoist = f => m => Middleware(s => f(m.evalState(s)).map(x => Tuple2(x, s)));

//Create lifted constructors
['reject', 'try', 'encase', 'fromForkable', 'node'].forEach(k => {
  Middleware[k] = x => Middleware.lift(Future[k](x));
});

Middleware.fromComputation = f => Middleware.lift(Future(f));

module.exports = Middleware;
