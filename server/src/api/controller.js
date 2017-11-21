/**
 * Server API controller.
 * @module api/controller
 */
const log    = require(`${SERVER_ROOT}/server/log`);
const model  = require(`${SERVER_ROOT}/api/model`);
const routes = require(`${SERVER_ROOT}/api/routes`);
const util   = require(`${SERVER_ROOT}/util`);

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
        badRequest(request, response, error, 400);
        request.connection.destroy();
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
            return endpoint.callback.call(endpoint, request, response);
        }
    }
    // If we get here, there was no handler defined for the endpoint and method.
    return badRequest(request, response);
}

/**
 * Get the body data from a request.
 * @param request The request.
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
 * @param [code] An optional HTTP response code.
 */
function badRequest(request, response, message, code) {
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
    }, code);
}

/**
 * Respond to an HTTP request.
 * @param response The HTTP response.
 * @param json JSON data to write.
 * @param [code] An optional HTTP response code.
 */
function doResponse(response, json, code) {
    log.trace(module, doResponse);
    if (util.isNullOrUndefined(code)) {
        code = 200;
    }
    response.statusCode = code;
    response.setHeader('Content-Type', 'application/json');
    response.end(JSON.stringify(json));
}

module.exports.handleRequest  = handleRequest;
module.exports.badRequest     = badRequest;
module.exports.getRequestBody = getRequestBody;
module.exports.doResponse     = doResponse;
