/**
 * Configuration of the server.
 * @module server/config
 */
const log = require(`${global.SERVER_ROOT}/server/log`);

/**
 * Default values for configuration. Uses environment variables if available, otherwise defines
 * sensible defaults.
 */
module.exports.defaults = {
    LOGLEVEL:    process.env.LOGLEVEL || log.LogLevel.DEBUG,
    ADDRESS:     process.env.ADDRESS  || '127.0.0.1',
    PORT:        process.env.PORT     || 80,
    DB_HOST:     process.env.DB_HOST  || 'localhost',
    DB_PORT:     process.env.DB_PORT  || 3306,
    DB_NAME:     process.env.DB_NAME  || 'serverDB',
    DB_USER:     process.env.DB_USER  || 'user',
    DB_PASS:     process.env.DB_PASS  || 'password'
};
