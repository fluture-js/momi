'use strict';

const express = require('express')();
const {App, Middleware} = require('../../');

const app = _ => Middleware.of({
  status: 200,
  body: 'Hello from momi\n',
  headers: {'X-Powered-By': 'momi'}
});

express.get('/', (req, res) => res.send('Go to /momi\n'));
express.get('/momi', App.connect(app));

express.listen(3000);
