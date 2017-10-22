'use strict';

const http   = require('./server-http');
const config = require('./server-config');

http.startServer(config.defaults);
