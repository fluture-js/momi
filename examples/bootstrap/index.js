/* eslint no-console:0 */

import {fork} from 'fluture';
import R from 'ramda';

import {run} from '../../index.js';

import {
  serviceBootstrapper,
  configurationBootstrapper,
  databasePoolBootstrapper,
  httpServerBootstrapper,
  resolveOnSigintBootstrapper
} from './bootstrappers.js';

const bootstrap = R.compose (
  serviceBootstrapper,
  configurationBootstrapper,
  databasePoolBootstrapper,
  httpServerBootstrapper,
  resolveOnSigintBootstrapper
);

fork (e => {
  console.error ('Process failed to bootstrap');
  console.error (e.stack);
  process.exit (1);
}) ( _ => {
  console.log ('Process finished with no errors');
  process.exit (0);
}) (run (bootstrap, null));
