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

function print(level, msg) {
    if (level >= logLevel) {
        return console.log(formatMessage(level, msg));
    }
}

module.exports.LogLevel = LogLevel;
module.exports.print = print;
module.exports.debug = function(msg) { return print(LogLevel.DEBUG, msg); }
module.exports.info  = function(msg) { return print(LogLevel.INFO,  msg); }
module.exports.warn  = function(msg) { return print(LogLevel.WARN,  msg); }
module.exports.error = function(msg) { return print(LogLevel.ERROR, msg); }
