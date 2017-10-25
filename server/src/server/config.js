/**
 * Configuration of the server.
 * @module server/config
 */
'use strict';

const log = require('./log');

/**
 * Default values for configuration. Uses environment variables if available, otherwise defines
 * sensible defaults.
 */
module.exports.defaults = {
    LOGLEVEL: process.env.LOGLEVEL || log.LogLevel.DEBUG,
    ADDRESS:  process.env.ADDRESS  || '127.0.0.1',
    PORT:     process.env.PORT     || 80,
    DATABASE: process.env.DATABASE || 'server.db'
};
