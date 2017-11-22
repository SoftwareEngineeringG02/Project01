/**
 * Various utility functions.
 * @module util
 */
const fs   = require('fs');
const ip   = require('ip');
const path = require('path');

/**
 * Return true if the object has type 'undefined' or value 'null'.
 */
module.exports.isNullOrUndefined = function(object) {
    return typeof object === 'undefined' || object === null;
}

/**
 * Get the name of a module.
 * @param mod A reference to the module.
 * @return The name of the module, which is the filename minus the file extension.
 * @example getModuleName({filename: '/usr/src/module.js'}) ==> 'module'
 */
module.exports.getModuleName = function(mod) {
    return path.basename(mod.filename, path.extname(mod.filename));
}

/**
 * Get the qualified name of a function within a module.
 * @param mod A reference to the module the function resides in.
 * @param fun A reference to the function.
 * @return A string containing the name of the module and function in the format 'module.function'.
 * @example getFunctionName({filename: 'module.js'}, {name: 'foo'}) ==> 'module.foo'
 */
module.exports.getFunctionName = function(mod, fun) {
    return `${module.exports.getModuleName(mod)}.${fun.name}`;
}

/**
 * Iterate over a directory recursively.
 * @param dir The path to the directory.
 * @param callback A function called for each regular file contained in the directory or one of its
 * subdirectories.
 */
module.exports.walk = function(dir, callback) {
    fs.readdir(dir, (error, files) => {
        if (error) {
            throw error;
        }
        files.forEach((file) => {
            const filepath = path.join(dir, file);
            fs.stat(filepath, (error, stat) => {
                if (stat.isDirectory()) {
                    module.exports.walk(filepath, callback);
                } else if (stat.isFile()) {
                    callback(filepath);
                }
            });
        });
    });
}

/**
 * Get the server's local network IP address.
 */
module.exports.getLocalAddress = function() {
    return ip.address();
}

/**
 * Get the current UTC time as an ISO-formatted string.
 */
module.exports.getTimeStamp = function() {
    var d = new Date();
    return d.toISOString().replace('T', ' ').substr(0, 19);
}

module.exports.ServerError = function(message) {
    this.message = message;
    if (module.exports.isNullOrUndefined(message)) {
        this.message = 'Internal server error';
    }
    this.stack = (new Error()).stack;
}
