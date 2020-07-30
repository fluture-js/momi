import R from 'ramda';
import Z from 'sanctuary-type-classes';

import {modify, get} from '../../index.js';

//      putService :: String -> Any -> Middleware {services: Services} b ()
export const putService = (x, service) => modify (
  R.evolve ({services: R.assoc (x, service)})
);

//      getService :: String -> Middleware {services: Services} b Any
export const getService = x => Z.map (state => {
  const service = state.services[x];

  if (!service) {
    throw new Error (`The ${x} service has not been registerred`);
  }

  return service;
}, get);
