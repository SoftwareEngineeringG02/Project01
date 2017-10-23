'use strict';

const http   = require('http');
const log    = require('./log');

var server = undefined;

function requestHandler(request, response) {
    log.info('Request <address=' + request.connection.remoteAddress + ', url=' + request.url + '>');
    response.end('Success!');
}

function errorHandler(error) {
    return log.error(error);
}

module.exports.start = function(config) {
    log.info('====================[ Starting Server ]====================');
    log.info('Server process ID: ' + process.pid);
    server = http.createServer(requestHandler);
    server.on('error', errorHandler);
    server.listen(config['port'], function(error) {
        if (error) {
            return log.error(error);
        }
        process.on('exit', module.exports.stop);
        log.info('Listening on ' + config['address'] + ':' + config['port']);
    });
    return server;
}

module.exports.stop = function(reason) {
    if (server != undefined) {
        if (reason != undefined) {
            log.info('Server exiting because ' + reason)
        } else {
            log.info('Server exiting')
        }
        server.close();
    }
}
