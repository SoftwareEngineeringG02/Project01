/**
 * Server entry point.
 * @module server
 */
require('newrelic');

const path = require('path');
const http = require('http');
const https = require('https');

// Set SERVER_ROOT global to server root directory. Must be a POSIX-style path on all platforms.
global.SERVER_ROOT = path.resolve(__dirname).replace(/\\/g, '/');

const config     = require(`${SERVER_ROOT}/server/config.js`).defaults;
const controller = require(`${SERVER_ROOT}/api/controller`);
const database   = require(`${SERVER_ROOT}/database/mysql`);
const model      = require(`${SERVER_ROOT}/api/model`);
const routes     = require(`${SERVER_ROOT}/api/routes`);
const log        = require(`${SERVER_ROOT}/server/log`);
const util       = require(`${SERVER_ROOT}/util`);

init();

function init() {
    // Initialise log.
    log.setLogLevel(config.LOGLEVEL);
    log.info('====================[ Starting Server ]====================');
    log.info(`Server process ID: ${process.pid}`);
    log.info(`Server root directory: ${SERVER_ROOT}`);
    log.trace(module, init);
    // Initialise subsystems.
    routes.init();
    database.init(config, startServer);
}

function startServer(error) {
    log.trace(module, startServer);
    if (error) {
        handleError(error);
    }
    // Set up event handlers.
    process.on('uncaughtException', handleError);
    process.on('exit', handleExit);
    // Start the server.
    if (util.isNullOrUndefined(config.SSL_KEY)) {
        var server = http.createServer(controller.handleRequest);
    } else {
        ssl = { key: config.SSL_KEY, cert: config.SSL_CERT, ca: config.SSL_CA };
        var server = https.createServer(ssl, controller.handleRequest);
        config.PORT = config.SSL_PORT;
    }
    server.on('error', handleError);
    server.listen(config.PORT, (error) => {
        if (error) {
            handleError(error);
        }
        return log.info(`Listening on ${config.ADDRESS}:${config.PORT}`);
    });
}

// Called on 'exit' event.
function handleExit() {
    log.trace(module, handleExit);
    return log.info('Server exiting');
}

// Log error and exit.
function handleError(error) {
    if (error) {
        log.trace(module, handleError);
        log.error(`Fatal: ${error}`);
        process.exit(1);
    }
}
