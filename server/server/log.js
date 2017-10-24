'use strict';

const LogLevel = {
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

var logLevel = LogLevel.DEBUG;

function getTimeStamp() {
    var d = new Date();
    return d.toISOString().replace('T', ' ').substr(0, 19);
}

function formatMessage(level, msg) {
    return getTimeStamp() + ' ' + LogLevel.name[level] + ': ' + msg;
}

function print(level, msg, args) {
    if (level >= logLevel) {
        if (typeof args === 'undefined') {
            return console.log(formatMessage(level, msg));
        } else {
            return console.log(formatMessage(level, msg), args);
        }
    }
}

module.exports.LogLevel = LogLevel;
module.exports.print = print;
module.exports.debug = function(msg, args) { return print(LogLevel.DEBUG, msg, args); }
module.exports.info  = function(msg, args) { return print(LogLevel.INFO,  msg, args); }
module.exports.warn  = function(msg, args) { return print(LogLevel.WARN,  msg, args); }
module.exports.error = function(msg, args) { return print(LogLevel.ERROR, msg, args); }
