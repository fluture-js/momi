import express from 'express';
import {App, Middleware} from '../../';

const server = express();

const app = Middleware.of({
  status: 200,
  body: 'Hello from momi\n',
  headers: {'X-Powered-By': 'momi'}
});

server.get('/', (req, res) => res.send('Go to /momi\n'));
server.get('/momi', App.connect(_ => app));

server.listen(3000);
