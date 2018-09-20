import {Middleware} from '../../';
import R from 'ramda';

//      putService :: String -> Any -> Middleware {services: Services} b ()
export const putService = (x, service) => Middleware.modify(
  R.evolve({services: R.assoc(x, service)})
);

//      getService :: String -> Middleware {services: Services} b Any
export const getService = x => Middleware.get.map(state => {
  const service = state.services[x];

  if (!service) {
    throw new Error(`The ${x} service has not been registerred`);
  }

  return service;
});
