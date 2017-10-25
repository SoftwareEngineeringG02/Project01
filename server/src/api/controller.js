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
module.exports.handleRequest = function(request, response) {
    log.trace(module, module.exports.handleRequest);
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
        if (endpoint .href == url) {
            return endpoint.handler.call(endpoint, request, response);
        }
    }
    // If we get here, there was no handler defined for the endpoint.
    return badRequest(request, response);
}

// Endpoint links with handlers. (Handlers are stripped by JSON.stringify).
const links = [
    { rel: 'index',        href: '/',                methods: ['GET'],  handler: index       },
    { rel: 'get-location', href: '/location',        methods: ['POST'], handler: getLocation },
    { rel: 'set-location', href: '/location/update', methods: ['POST'], handler: setLocation }
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
    // Try to extract `id` and `time` JSON properties.
    const elems = {
        id:        'string',
        time:      'number'
    };
    var result = getJsonElements(request, response, elems);
    if (util.isNullOrUndefined(result)) {
        return badRequest(request, response, 'Incomplete request body');
    }
    result = model.getLocation(result.id);
    if (util.isNullOrUndefined(result)) {
        return badRequest(request, response, 'No location associated with ID');
    }
    const { longitude, latitude } = result;
    // Send response.
    return doResponse(response, {
        error:     0,
        message:   'Success',
        longitude: longitude,
        latitude:  latitude,
        links:     links
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
    var result = getJsonElements(request, response, elems);
    if (util.isNullOrUndefined(result)) {
        return badRequest(request, response, 'Incomplete request body');
    }
    const { id, time, longitude, latitude } = result;
    // Persist the values to the model.
    model.setLocation(id, time);
    return doResponse(response, {
        error:   0,
        message: 'Success',
        links:   links
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
function getJsonElements(request,  response, elems) {
    log.trace(module, getJsonElements);
    var dict = [];
    if (util.isNullOrUndefined(request.body)) {
        return null;
    }
    const data = JSON.parse(request.body);
    for (var i = 0; i < elems.length; ++i) {
        if (typeof data[elems.name] !== elems.type) {
            return null;
        } else {
            dict.push({key: elems.name, value: data[elems.name]});
        }
    }
    return dict;
}

// Write JSON data to the response.
function doResponse(response, json) {
    log.trace(module, doResponse);
    response.setHeader('Content-Type', 'application/json');
    response.end(JSON.stringify(json));
}
