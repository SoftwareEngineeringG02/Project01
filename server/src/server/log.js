/**
 * Server logging system. Writes formatted messages to
 * @module server/log
 */
const util = require(`${global.SERVER_ROOT}/util`);

/**
 * Log level.
 */
module.exports.LogLevel = {
    DEBUG: 0,
    INFO:  1,
    WARN:  2,
    ERROR: 3,
    name: {
        0: 'DEBUG',
        1: 'INFO',
        2: 'WARN',
        3: 'ERROR'
    }
};

/**
 * Change the minimum log level.
 * @param level The new minimum log level. Any messages sent to the log with a level below this will
 * be suppressed.
 * @return The previous log-level is returned.
 */
module.exports.setLogLevel = function(level) {
    const tmp = logLevel;
    logLevel = level;
    return tmp;
}

/**
 * Print a timestamped message to the log.
 * @param level The message's log level. Does nothing if this is lower than the current minimum log
 * level: @see LogLevel @see setLogLevel
 * @param msg A message string.
 * @param args An array of other arguments which are appended to the output.
 */
module.exports.print = function(level, msg, args) {
    if (level >= logLevel) {
        if (util.isNullOrUndefined(args)) {
            return console.log(formatMessage(level, msg));
        } else {
            return console.log(formatMessage(level, msg), args);
        }
    }
}

/**
 * Write a timestamped, debug-level message to the log. Does nothing if this is below the server's
 * current minimum log-level: @see LogLevel @see setLogLevel
 * @param msg A message string.
 * @param args An array of other arguments which are appended to the output.
 */
module.exports.debug = function(msg, args) {
    return print(LogLevel.DEBUG, msg, args);
}

/**
 * Write a timestamped, debug-level message to the log containing the name and module of a function.
 * Does nothing if this is below the server's current minimum log-level: @see LogLevel
 * @see setLogLevel
 */
module.exports.trace = function(mod, fun) {
    return print(LogLevel.DEBUG, util.getFunctionName(mod, fun));
}

/**
 * Write a timestamped, info-level message to the log. Does nothing if this is below the server's
 * current minimum log-level: @see LogLevel @see setLogLevel
 * @param msg A message string.
 * @param args An array of other arguments which are appended to the output.
 */
module.exports.info = function(msg, args) {
    return print(LogLevel.INFO,  msg, args);
}

/**
 * Write a timestamped, warning-level message to the log. Does nothing if this is below the server's
 * current minimum log-level: @see LogLevel @see setLogLevel
 * @param msg A message string.
 * @param args An array of other arguments which are appended to the output.
 */
module.exports.warn = function(msg, args) {
    return print(LogLevel.WARN,  msg, args);
}

/**
 * Write a timestamped, error-level message to the log. Does nothing if this is below the server's
 * current minimum log-level: @see LogLevel @see setLogLevel
 * @param msg A message string.
 * @param args An array of other arguments which are appended to the output.
 */
module.exports.error = function(msg, args) {
    return print(LogLevel.ERROR, msg, args);
}

// Alias out of `module.exports` object.
const LogLevel = module.exports.LogLevel;
const print = module.exports.print;

// Current minimum log-level.
var logLevel = LogLevel.DEBUG;

// Get the current UTC time as an ISO-formatted string.
function getTimeStamp() {
    var d = new Date();
    return d.toISOString().replace('T', ' ').substr(0, 19);
}

// Format a message with the timestamp and log level marker.
function formatMessage(level, msg) {
    return getTimeStamp() + ' ' + LogLevel.name[level] + ': ' + msg;
}
