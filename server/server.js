/**
 * Server entry point.
 * @module server
 * @author Chris Swinchatt <c.swinchatt@sussex.ac.uk>
 */
'use strict';

const config     = require('./server/config').defaults;
const controller = require('./api/controller');
const http       = require('http');
const log        = require('./server/log');

log.info('====================[ Starting Server ]====================');
log.info('Server process ID: ' + process.pid);

process.on('exit', handleExit);

var server = http.createServer(controller.handleRequest);
server.on('error', handleError);
server.listen(config['port'], (error) => {
    if (error) {
        handleError(error);
    }
    log.info('Listening on ' + config['address'] + ':' + config['port']);
});

function handleExit() {
    log.info('Server exiting');
}

function handleError(error) {
    log.error(error);
    process.exit(1);
}
