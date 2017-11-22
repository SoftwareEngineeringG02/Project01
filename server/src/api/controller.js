/**
 * Server API controller.
 * @module api/controller
 */
const log    = require(`${SERVER_ROOT}/server/log`);
const model  = require(`${SERVER_ROOT}/api/model`);
const routes = require(`${SERVER_ROOT}/api/routes`);
const util   = require(`${SERVER_ROOT}/util`);

module.exports.handleRequest  = handleRequest;
module.exports.badRequest     = badRequest;
module.exports.getRequestBody = getRequestBody;
module.exports.doResponse     = doResponse;

/**
 * Initialise the controller.
 * @param config The configuration.
 */
function init(config, callback) {
    log.trace(module, init);
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
    // Set up error handler.
    request.on('error', (error) => {
        if (util.isNullOrUndefined(response.statusCode) || response.statusCode == 0 || response.statusCode == 200) {
            response.statusCode = 400;
        }
        badRequest(request, response, error.toString());
        request.connection.destroy();
    });
    const { method, url } = request;
    // Call the handler for the endpoint if it exists.
    for (var i = 0; i < routes.endpoints.length; ++i) {
        const endpoint = routes.endpoints[i];
        if (endpoint.href === url && method === endpoint.method) {
            return endpoint.callback.call(endpoint, request, response);
        }
    }
    // If we get here, there was no handler defined for the endpoint and method.
    return badRequest(request, response);
}

/**
 * Get the body data from a request.
 * @param request The request.
 * @param response The response.
 * @param callback A function(error, data) which processes the body data.
 */
function getRequestBody(request, callback) {
    log.trace(module, getRequestBody);
    var body = '';
    request.on('data', (data) => {
        body += data;
        // Check for buffer overrun attack. Return error if data too large.
        if (body.length > 1e6) {
            body = '';
            callback(new Error('Request body too large'));
        }
    });
    request.on('end', () => { callback(null, body) });
}

/**
 * Handle invalid requests e.g. bad endpoint, wrong method, or missing/invalid data.
 * @param request The HTTP request.
 * @param response The HTTP response.
 * @param [message] An optional error message.
 * @param [status] An optional HTTP status code.
 * @param [requestID] @see model.startRequest @see model.endRequest
 */
function badRequest(request, response, message, status) {
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
    }, status);
}

/**
 * Respond to an HTTP request.
 * @param response The HTTP response.
 * @param json JSON data to write.
 * @param [status] An optional HTTP status code.
 * @param [requestID] @see model.startRequest @see model.endRequest
 */
function doResponse(response, json, status, requestID) {
    log.trace(module, doResponse);
    if (util.isNullOrUndefined(status)) {
        status = 200;
    }
    response.statusCode = status;
    response.setHeader('Content-Type', 'application/json');
    response.end(JSON.stringify(json));
    if (!(util.isNullOrUndefined(requestID))) {
        model.endRequest(requestID, status, (error) => {
            if (error) {
                log.warn(error);
            }
        });
    }
}
