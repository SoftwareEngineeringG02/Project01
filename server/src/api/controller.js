/**
 * Server API controller.
 * @module api/controller
 */
'use strict';

const log   = require('../server/log');
const model = require('./model');
const util  = require('../util');

/**
 * Initialise the controller.
 * @param config The configuration.
 */
module.exports.init = function(config) {
    return model.init(config);
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
    for (var i = 0; i < links.length; ++i) {
        const endpoint = links[i];
        if (endpoint.href == url && method == endpoint.method) {
            return endpoint.handler.call(endpoint, request, response);
        }
    }
    // If we get here, there was no handler defined for the endpoint and method.
    return badRequest(request, response);
}

module.exports.handleRequest = handleRequest;

// Endpoint links with handlers (handlers are stripped by JSON.stringify).
const links = [
    { rel: 'index',        href: '/',                method: 'GET',  handler: index       },
    { rel: 'get-location', href: '/location',        method: 'POST', handler: getLocation },
    { rel: 'set-location', href: '/location/update', method: 'POST', handler: setLocation }
];

// Handle the 'index' endpoint.
function index(request, response) {
    log.trace(module, index);
    return doResponse(response, {
        error:   0,
        message: 'Success',
        links:   links
    });
}

// Handle the 'get-location' endpoint.
function getLocation(request, response) {
    log.trace(module, getLocation);
    // Try to extract `id` JSON property.
    getJsonElements(request, {'id': 'string'}, (result) => {
        if (typeof result !== 'object') {
            return badRequest(request, response, result);
        }
        if (util.isNullOrUndefined(result.id)) {
            return badRequest(request, response, 'Incomplete request');
        }
        result = model.getLocation(result.id);
        if (util.isNullOrUndefined(result)) {
            return badRequest(request, response, 'No location associated with ID');
        }
        const { longitude, latitude } = result;
        // Send response.
        doResponse(response, {
            error:     0,
            message:   'Success',
            longitude: longitude,
            latitude:  latitude,
            links:     links
        });
    });
}

// Handle the 'set-location' endpoint.
function setLocation(request, response) {
    log.trace(module, setLocation);
    // Try to extract `id`, `time`, `longitude` and `latitude` JSON properties.
    const elems = {
        id:        'string',
        time:      'number',
        longitude: 'number',
        latitude:  'number'
    };
    getJsonElements(request, elems, (result) => {
        if (typeof result !== 'object' || result == null) {
            return badRequest(request, response, result);
        }
        const { id, time, longitude, latitude } = result;
        if (util.isNullOrUndefined(id)
         || util.isNullOrUndefined(time)
         || util.isNullOrUndefined(longitude)
         || util.isNullOrUndefined(latitude)) {
            return badRequest(request, response, 'Incomplete request');
        }
        // Persist the values to the model.
        model.setLocation(id, time, longitude, latitude);
        doResponse(response, {
            error:   0,
            message: 'Success',
            links:   links
        });
    });
}

// Handle invalid requests e.g. bad endpoint, wrong method, or missing/invalid data.
function badRequest(request, response, message) {
    log.trace(module, badRequest);
    if (util.isNullOrUndefined(message)) {
        const { method, url } = request;
        message = `Bad request: ${method} '${url}'`;
    }
    log.warn(message);
    return doResponse(response, {
        error:   1,
        message: message,
        links:   links
    });
}

// Extract JSON data from request with rudimentary type-checking.
function getJsonElements(request, elems, callback) {
    log.trace(module, getJsonElements);
    if (typeof callback !== 'function') {
        return null;
    }
    var body = '';
    // Receive request data.
    request.on('data', (data) => {
        body += data;
        // Check for buffer overrun attack. End connection and return error if too much data.
        if (body.length > 1e6) {
            body = '';
            request.connection.destroy();
        }
    });
    // Parse request body.
    request.on('end', function() {
        if (body == '') {
            return callback('Empty request body');
        }
        // Try to parse the body as JSON.
        var object;
        try {
            object = JSON.parse(body);
        } catch (SyntaxError) {
            return callback('Invalid JSON data');
        }
        // Extract the elements named by 'elems'.
        var result = {};
        for (var name in elems) {
            var type = elems[name];
            if (!(util.isNullOrUndefined(object[name])) && typeof object[name] === type) {
                result[name] = object[name];
            }
        }
        // Forward the dictionary to callback.
        callback(result);
    });
}

// Write JSON data to the response.
function doResponse(response, json) {
    log.trace(module, doResponse);
    response.setHeader('Content-Type', 'application/json');
    response.end(JSON.stringify(json));
}
