/* eslint no-console:0 */

import {App} from '../../';
import {
  serviceBootstrapper,
  configurationBootstrapper,
  databasePoolBootstrapper,
  httpServerBootstrapper,
  resolveOnSigintBootstrapper
} from './bootstrappers.mjs';

const bootstrap = App.empty()
.use(serviceBootstrapper)
.use(configurationBootstrapper)
.use(databasePoolBootstrapper)
.use(httpServerBootstrapper)
.use(resolveOnSigintBootstrapper);

App.run(bootstrap, null).fork(
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
