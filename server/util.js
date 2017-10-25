/**
 * Various utility functions.
 * @module util
 */
'use strict';

/**
 * Return true if the object has type 'undefined' or value 'null'.
 */
module.exports.isNullOrUndefined = function(object) {
    return typeof object === 'undefined' || object == null;
}
