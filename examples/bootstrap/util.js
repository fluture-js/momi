'use strict';

const {Middleware} = require('../../');
const {assoc, evolve} = require('ramda');

//      putService :: String -> Any -> Middleware {services: Services} b ()
exports.putService = (x, service) => Middleware.modify(evolve({services: assoc(x, service)}));

//      getService :: String -> Middleware {services: Services} b Any
exports.getService = x => Middleware.get.map(state => {
  const service = state.services[x];
  if(!service) {
    throw new Error(`The ${x} service has not been registerred`);
  }
  return service;
});
