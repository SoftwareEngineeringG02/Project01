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

log.setLogLevel(config.LOGLEVEL);

controller.init(config);

log.info('====================[ Starting Server ]====================');
log.info('Server process ID: ' + process.pid);

process.on('exit', handleExit);

var server = http.createServer(controller.handleRequest);
server.on('error', handleError);
server.listen(config.PORT, (error) => {
    if (error) {
        handleError(error);
    }
    return log.info('Listening on ' + config.ADDRESS + ':' + config.PORT);
});

// Called on 'exit' event.
function handleExit() {
    return log.info('Server exiting');
}

// Log error and exit.
function handleError(error) {
    log.error(error);
    process.exit(1);
}
