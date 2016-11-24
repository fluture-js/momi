'use strict';

/*eslint no-console:0*/

const {App} = require('../../');
const B = require('./bootstrappers');

const bootstrap = App.empty()
.use(B.serviceBootstrapper)
.use(B.configurationBootstrapper)
.use(B.databasePoolBootstrapper)
.use(B.httpServerBootstrapper)
.use(B.resolveOnSigintBootstrapper);

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
