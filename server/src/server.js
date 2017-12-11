/**
 * Server entry point.
 * @module server
 */
require('newrelic');

var path  = require('path');
var http  = require('http');
var https = require('https');
var fs    = require('fs');

// Set SERVER_ROOT global to server root directory. Must be a POSIX-style path on all platforms.
global.SERVER_ROOT = path.resolve(__dirname).replace(/\\/g, '/');

var config     = require(`${SERVER_ROOT}/server/config.js`).defaults;
var controller = require(`${SERVER_ROOT}/api/controller`);
var database   = require(`${SERVER_ROOT}/database/mysql`);
var model      = require(`${SERVER_ROOT}/api/model`);
var routes     = require(`${SERVER_ROOT}/api/routes`);
var log        = require(`${SERVER_ROOT}/server/log`);
var util       = require(`${SERVER_ROOT}/util`);

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
    process.on('exit', handleExit);
    // Listen for HTTP connections if enabled.
    if (config.USE_HTTP) {
        startHTTP();
    }
    // Listen for HTTPS connections if enabled.
    if (config.USE_HTTPS && !(util.isNullOrUndefined(config.SSL_KEY))) {
        startHTTPS();
    }
}

function startHTTP() {
    log.trace(module, startHTTP);
    const server = http.createServer(controller.handleRequest);
    server.on('error', handleError);
    server.listen(config.PORT, serverListener.bind(null, config.PORT));
}

function startHTTPS() {
    log.trace(module, startHTTPS);
    var ssl = {
        key:  fs.readFileSync(config.SSL_KEY),
        cert: fs.readFileSync(config.SSL_CERT)
    };
    const server = https.createServer(ssl, controller.handleRequest);
    server.on('error', handleError);
    server.listen(config.SSL_PORT, serverListener.bind(null, config.SSL_PORT));
}

function serverListener(port, error) {
    if (error) {
        return handleError(error);
    }
    log.info(`Listening on ${config.ADDRESS}:${port}`);
}

// Called on 'exit' event.
function handleExit(error) {
    log.trace(module, handleExit);
    if (error) {
        log.error(`Server exiting due to error: ${error}`);
        process.exit(1);
    }
    log.info('Server exiting');
    process.exit(0);
}

// Log error and exit.
function handleError(error) {
    if (error) {
        log.trace(module, handleError);
        log.error(`Fatal: ${error.message}`);
        process.exit(1);
    }
}
