'use strict';

var http   = require('./server-http');
var config = require('./server-config');

http.startServer(config.defaults);
