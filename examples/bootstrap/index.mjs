/* eslint no-console:0 */

import {run} from '../../';
import R from 'ramda';

import {
  serviceBootstrapper,
  configurationBootstrapper,
  databasePoolBootstrapper,
  httpServerBootstrapper,
  resolveOnSigintBootstrapper
} from './bootstrappers.mjs';

const bootstrap = R.compose(
  serviceBootstrapper,
  configurationBootstrapper,
  databasePoolBootstrapper,
  httpServerBootstrapper,
  resolveOnSigintBootstrapper
);

run(bootstrap, null).fork(
  e => {
    console.error('Process failed to bootstrap');
    console.error(e.stack);
    process.exit(1);
  },
  _ => {
    console.log('Process finished with no errors');
    process.exit(0);
  }
);
