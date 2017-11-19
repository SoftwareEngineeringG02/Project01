/**
 * Server API controller.
 * @module api/controller
 */
const log    = require(`${global.SERVER_ROOT}/server/log`);
const model  = require(`${global.SERVER_ROOT}/api/model`);
const routes = require(`${global.SERVER_ROOT}/api/routes`);
const util   = require(`${global.SERVER_ROOT}/util`);

/**
 * Initialise the controller.
 * @param config The configuration.
 */
module.exports.init = function(config, callback) {
    routes.init(config, () => { model.init(config, callback); });
}

/**
 * Handle an HTTP request.
 * Matches the endpoint in the request to its appropriate handler, or badRequest if there is an
 * error.
 * @param request The client's request.
 * @param response The server's response.
 */
function handleRequest(request, response) {
    log.trace(module, handleRequest);
    request.on('error', (error) => {
        badRequest(request, response, error);
    });
    const { method, url, headers } = request;
    // Log user info.
    const address = request.connection.remoteAddress;
    const agent   = headers['user-agent'];
    log.info(`Request <address=${address}, request=${method} ${url}, user-agent=${agent}>`);
    // Call the handler for the endpoint if it exists.
    for (var i = 0; i < routes.endpoints.length; ++i) {
        const endpoint = routes.endpoints[i];
        if (endpoint.href === url && method === endpoint.method) {
            try {
                return endpoint.callback.call(endpoint, request, response);
            } catch (error) {
                // If an exception occurs, log it, return an error to the client, and kill the
                // connection.
                log.error(error.toString());
                badRequest(request, response, error.toString());
                request.connection.destroy();
            }
        }
    }
    // If we get here, there was no handler defined for the endpoint and method.
    return badRequest(request, response);
}

module.exports.handleRequest = handleRequest;

// Handle invalid requests e.g. bad endpoint, wrong method, or missing/invalid data.
function badRequest(request, response, message) {
    log.trace(module, badRequest);
    if (util.isNullOrUndefined(message)) {
        const { method, url } = request;
        message = `Bad request: ${method} ${url}`;
    }
    log.warn(message);
    return doResponse(response, {
        'error':   1,
        'message': message,
        'links':   routes.endpoints
    });
}

module.exports.badRequest = badRequest;

// Extract the body data from a request.
// Throws:
// * TypeError if 'callback' is not a function
// * Error if there is a problem with the request
function getRequestBody(request, callback) {
    log.trace(module, getRequestBody);
    if (typeof callback !== 'function') {
        throw new TypeError('Expected callback function');
    }
    var body = '';
    request.on('data', (data) => {
        body += data;
        // Check for buffer overrun attack. Throws exception if data too large.
        if (body.length > 1e6) {
            body = '';
            throw new Error('Request body too large');
        }
    });
    request.on('end', function() {
        callback(body);
    });
}

module.exports.getRequestBody = getRequestBody;

// Write JSON data to the response.
function doResponse(response, json) {
    log.trace(module, doResponse);
    response.setHeader('Content-Type', 'application/json');
    response.end(JSON.stringify(json));
}

module.exports.doResponse = doResponse;
