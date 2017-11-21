/**
 * Endpoint routing logic.
 * @module api/routes
 */
const path = require('path');
const log  = require(`${SERVER_ROOT}/server/log`);
const util = require(`${SERVER_ROOT}/util`);

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
    var endpoints = [];
    // Find all Javascript files in dir.
    util.walk(dir, (filepath) => {
        filepath = path.posix.normalize(filepath.replace(/\\/g, '/'));
        if (path.extname(filepath) == '.js') {
            const relPath = filepath.replace(dir, '');
            // Try to load the module
            var epModule;
            try {
                epModule = require(filepath);
            } catch (error) {
                // This error probably indicates that the file is not a valid Javascript source
                // file. Log the error and skip.
                return log.warn(`${relPath}: ${error}`);
            }
            // Check for REL, METHOD and CALLBACK.
            if (util.isNullOrUndefined(epModule.REL)
             || util.isNullOrUndefined(epModule.METHOD)
             || util.isNullOrUndefined(epModule.CALLBACK)) {
                // Not a valid module - log and skip.
                return log.warn(`Javascript source file ${filepath} does not define an endpoint`);
            }
            // Compute the endpoint path from the filepath. If the module is called 'index.js',
            // strip the filename from the path.
            var epPath = relPath.replace('.js', '');
            if (path.basename(epPath) == 'index') {
                epPath = path.dirname(epPath);
            }
            // Append the endpoint to the table.
            log.info(`Adding endpoint ${epModule.REL}=${epPath}`);
            endpoints.push({
                'rel':      epModule.REL,
                'href':     epPath,
                'method':   epModule.METHOD,
                'callback': epModule.CALLBACK
            });
        }
    });
    module.exports.endpoints = endpoints;
}

module.exports.init = init;
