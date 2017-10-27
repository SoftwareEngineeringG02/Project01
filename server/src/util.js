/**
 * Various utility functions.
 * @module util
 */
const fs   = require('fs');
const path = require('path');

/**
 * Return true if the object has type 'undefined' or value 'null'.
 */
module.exports.isNullOrUndefined = function(object) {
    return typeof object === 'undefined' || object == null;
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
    if (typeof mod !== 'object') {
        throw new TypeError(`Expected a module`);
    }
    if (typeof fun !== 'function') {
        throw new TypeError(`Expected a function`);
    }
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
 * Extract JSON objects from HTTP request body data with rudimentary type-checking.
 * @param body A buffer che HTTP request body.
 * @param elems A dictionary associating object names to their expected types, e.g. 'string',
 * 'object' or 'number.'
 * @return A Javascript object containing the items found, if any.
 */
module.exports.getJsonElements = function(body, elems) {
    // Try to parse the body as JSON.
    var object;
    try {
        object = JSON.parse(body);
    } catch (SyntaxError) {
        throw new Error('Invalid JSON data');
    }
    // Extract the elements named by 'elems'.
    var result = {};
    for (var name in elems) {
        var type = elems[name];
        if (!(module.exports.isNullOrUndefined(object[name]))) {
            if (typeof object[name] !== type) {
                throw new Error('Invalid JSON data');
            }
            result[name] = object[name];
        }
    }
    return result;
}
