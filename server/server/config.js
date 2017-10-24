/**
 * Configuration of the server.
 * @module server/config
 */
'use strict';

/**
 * Default values for configuration. Uses environment variables if available, otherwise defines
 * sensible defaults.
 */
module.exports.defaults = {
    'address': process.env.ADDRESS || '127.0.0.1',
    'port':    process.env.PORT    || 80
};
