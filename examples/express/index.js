import express from 'express';
import Z from 'sanctuary-type-classes';

import {connect, Middleware} from '../../index.js';

const server = express ();

const app = Z.of (Middleware, {
  status: 200,
  body: 'Hello from momi\n',
  headers: {'X-Powered-By': 'momi'}
});

server.get ('/', (req, res) => res.send ('Go to /momi\n'));
server.get ('/momi', connect (_ => app));

server.listen (3000);
