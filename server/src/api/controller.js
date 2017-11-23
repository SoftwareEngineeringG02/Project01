/**
 * Server API controller.
 * @module api/controller
 */
const log    = require(`${SERVER_ROOT}/server/log`);
const model  = require(`${SERVER_ROOT}/api/model`);
const routes = require(`${SERVER_ROOT}/api/routes`);
const util   = require(`${SERVER_ROOT}/util`);

module.exports.handleRequest = handleRequest;

/**
 * Handle an HTTP request.
 * Matches the endpoint in the request to its appropriate handler, or badRequest if there is an
 * error.
 * @param request The client's request.
 * @param response The server's response.
 */
function handleRequest(request, response) {
    log.trace(module, handleRequest);
    // Set error handler.
    request.on('error', badRequest.bind(null, request, response, 400));
    // Find endpoint.
    const { method, url } = request;
    const endpoint = getRequestHandler(method, url);
    if (util.isNullOrUndefined(endpoint)) {
        return badRequest(request, response);
    }
    // Call endpoint handler.
    if (method == 'GET') {
        return endpoint.callback.call(null)
            .then(({status, body}) => endRequest(null, response, status, body))
    } else if (method == 'POST') {
        return handlePost(request, response, endpoint)
    }
    // No handler for requested endpoint.
    return badRequest(request, response);
}

function getRequestHandler(method, url) {
    for (var i = 0; i < routes.endpoints.length; ++i) {
        const endpoint = routes.endpoints[i];
        if (method === endpoint.method && endpoint.href === url) {
            return endpoint;
        }
    }
    return null;
}

function handlePost(request, response, endpoint) {
    var inputs    = null;
    var requestID = null;
    return getRequestBody(request)
        .then(body   => getJsonElements(body, endpoint.inputs))
        .then(object => {
            inputs = object;
            return startRequest(request, inputs.id);
        })
        .then(reqID => {
            requestID = reqID;
            return endpoint.callback.call(null, inputs);
        })
        .then(({status, body}) => {
            return endRequest(requestID, response, status, body);
        })
        .catch(error => {
            badRequest(request, response, error, requestID);
        })
    ;
}

function startRequest(request, client) {
    log.trace(module, startRequest);
    return model.startRequest(request, client);
}

function endRequest(requestID, response, status, body) {
    log.trace(module, endRequest);
    response.statusCode = status;
    response.setHeader('Content-Type', 'application/json');
    body.links = routes.endpoints;
    response.end(JSON.stringify(body));
    if (!(util.isNullOrUndefined(requestID))) {
        return model.endRequest(requestID, response.statusCode);
    }
}

function badRequest(request, response, error, requestID) {
    if (util.isNullOrUndefined(error)) {
        error = { message: `Bad request: ${request.method} ${request.url}` };
    } else {
        if (!(error instanceof util.ServerError)) {
            // Hide internal error messages from clients.
            log.error(error.message);
            error.message = 'Internal server error';
        }
    }
    endRequest(requestID, response, 400, { 'error': 1, message: error.message });
    if (error instanceof Error && !(error instanceof util.ServerError)) {
        // Crash on JS exceptions.
        log.error(error.stack);
        process.exit(1);
    }
}

/**
 * Get the body data from a request.
 * @param request The request.
 * @param response The response.
 */
function getRequestBody(request) {
    return new Promise((resolve, reject) => {
        var body = '';
        request.on('data', data => {
            body += data;
            // Check for buffer overrun attack. Return error if data too large.
            if (body.length > 1e6) {
                body = '';
                reject(new util.ServerError('Request body too large'));
            }
        });
        request.on('end', () => { resolve(body) });
    });
}

/**
 * Extract JSON objects from HTTP request body data with rudimentary type-checking.
 * @param body A buffer che HTTP request body.
 * @param elems A dictionary associating object names to their expected types, e.g. 'string',
 * 'object' or 'number.'
 */
function getJsonElements(body, elems) {
    return new Promise((resolve, reject) => {
        // Try to parse the body as JSON.
        try {
            var object = JSON.parse(body);
        } catch (error) {
            return reject(error);
        }
        // Extract the elements named by 'elems'.
        var result = {};
        for (var name in elems) {
            const type = elems[name];
            if (util.isNullOrUndefined(object[name])) {
                reject(new util.ServerError(`${name}: undefined property`));
            }
            if (typeof object[name] !== type) {
                reject(new util.ServerError(`${name}: expected ${type}, got ${typeof object[name]}`));
            }
            result[name] = object[name];
        }
        resolve(result);
    });
}
