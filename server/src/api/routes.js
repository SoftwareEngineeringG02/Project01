/**
 * Endpoint routing logic.
 * @module api/routes
 */
const path = require('path');
const log  = require(`${SERVER_ROOT}/server/log`);
const util = require(`${SERVER_ROOT}/util`);

module.exports.init      = init;
module.exports.endpoints = [];

/**
 * Initialise routing.
 *
 * This builds the endpoint table, which lists the endpoints available along with the HTTP method
 * they respond to and the function to call when the endpoint is requested by that method.
 *
 * Each endpoint is defined by a Javascript module (ending with the .js extension) in a
 * subdirectory of 'api/routes/'. The path of the module relative to api/routes determines the
 * endpoint path. For example, 'api/routes/foo/bar.js' defines the endpoint '/foo/bar'.
 *
 * Files called index.js are treated specially in that they handle the endpoint for their
 * parent directory. For example, 'api/routes/foo/index.js' defines the endpoint '/foo'.
 *
 * @return The endpoint table is returned. The endpoint table is an array of JavaScript objects with
 * three properties: 'path', which names the endpoint's path, 'method', which names the HTTP method
 * it supports ('GET', 'PUT', 'POST' or 'DELETE'), and 'callback', which is the function to call
 * when the endpoint is requested. Callbacks take two arguments: an http.Request object, and an
 * http.Response object.
 */
function init() {
    log.trace(module, init);
    const dir = `${SERVER_ROOT}/api/routes`;
    // Find all Javascript files in dir.
    util.walk(dir, (filePath) => {
        filePath = path.posix.normalize(filePath.replace(/\\/g, '/'));
        if (path.extname(filePath) == '.js') {
            const relPath = filePath.replace(dir, '');
            // Try to load the module
            var epModule = require(filePath);
            // Check for REL, METHOD and CALLBACK.
            if (util.isNullOrUndefined(epModule.REL)
             || util.isNullOrUndefined(epModule.METHOD)
             || util.isNullOrUndefined(epModule.INPUTS)
             || util.isNullOrUndefined(epModule.CALLBACK)) {
                // Not a valid module - log and skip.
                return log.warn(`Javascript source file ${filePath} does not define an endpoint`);
            }
            // Compute the endpoint path from the filePath. If the module is called 'index.js',
            // strip the filename from the path.
            var epPath = relPath.replace('.js', '');
            if (path.basename(epPath) == 'index') {
                epPath = path.dirname(epPath);
            }
            // Append the endpoint to the table.
            log.info(`Adding endpoint ${epModule.REL}=${epPath}`);
            module.exports.endpoints.push({
                'rel':      epModule.REL,
                'href':     epPath,
                'method':   epModule.METHOD,
                'inputs':   epModule.INPUTS,
                'callback': epModule.CALLBACK
            });
        }
    });
}
