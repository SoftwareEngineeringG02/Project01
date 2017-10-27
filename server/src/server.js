/**
 * Server entry point.
 * @module server
 */

const path = require('path');

// Set SERVER_ROOT global to server root directory. Must be a POSIX-style path on all platforms.
global.SERVER_ROOT = path.resolve(__dirname).replace(/\\/g, '/');

const config     = require(`${global.SERVER_ROOT}/server/config`).defaults;
const controller = require(`${global.SERVER_ROOT}/api/controller`);
const http       = require('http');
const log        = require(`${global.SERVER_ROOT}/server/log`);
const util       = require(`${SERVER_ROOT}/util`);

// Set log level.
log.setLogLevel(config.LOGLEVEL);

// Initialise controller.
controller.init(config);

// Initialise log.
log.info('====================[ Starting Server ]====================');
log.info(`Server process ID: ${process.pid}`);
log.info(`Server root directory: ${SERVER_ROOT}`);

// Set up event handlers.
process.on('uncaughtException', (error) => {
    log.error(error);
    process.exit(1);
});
process.on('exit', handleExit);

// Start the server.
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
