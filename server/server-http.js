'use strict';

const http   = require('http');
const log    = require('./server-log');
var   server = undefined;

function requestHandler(request, response) {
    log.info('Request <address=' + request.connection.remoteAddress + ', url=' + request.url + '>');
    response.end('Success!');
}

function errorHandler(error) {
    return log.error(error);
}

module.exports.startServer = function(config) {
    log.info('====================[ Starting Server ]====================');
    server = http.createServer(requestHandler);
    server.on('error', errorHandler);
    server.listen(config['port'], config['address'], function(error) {
        if (error) {
            return log.error(error);
        }
        log.info('Listening on ' + config['address'] + ':' + config['port']);
    });
    return server;
}

module.exports.stopServer = function() {
    if (server != undefined) {
        server.close();
    }
}
