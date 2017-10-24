/**
 * Server API controller.
 * @module api/controller
 */
'use strict';

const log   = require('../server/log');
const model = require('./model');

/**
 * Handle an HTTP request.
 * Matches the endpoint in the request to its appropriate handler, or badRequest if there is an
 * error.
 * @param request The client's request.
 * @param response The server's response.
 */
module.exports.handleRequest = function(request, response) {
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
    badRequest(request, response);
}

const links = [
    { rel: 'index',        href: '/',                handler: index,       methods: ['GET']  },
    { rel: 'get-location', href: '/location',        handler: getLocation, methods: ['POST'] },
    { rel: 'set-location', href: '/location/update', handler: setLocation, methods: ['POST'] }
];

// Write JSON data to the response.
function doResponse(response, json) {
    response.setHeader('Content-Type', 'application/json');
    response.end(JSON.stringify(json));
}

// Handle the 'index' endpoint.
function index(request, response) {
    doResponse(response, {
        error:   0,
        message: 'Success',
        links:   links
    });
}

// Handle the 'get-location' endpoint.
function getLocation(request, response) {
    // TODO: retrieve long/lat from model.
    const longitude = 0.0;
    const latitude = 0.0;
    doResponse(response, {
        error:     0,
        message:   'Success',
        longitude: longitude,
        latitude:  latitude,
        links:     links
    });
}

// Handle the 'set-location' endpoint.
function setLocation(request, response) {
    if (typeof request.body === 'undefined') {
        return badRequest(request, response, 'Request did not include JSON object');
    }
    const data = JSON.parse(request.body);
    if (typeof data.id        !== 'string'
     || typeof data.time      !== 'number'
     || typeof data.longitude !== 'number'
     || typeof data.latitude  !== 'number') {
        return badRequest(request, response, 'JSON object was invalid or had missing fields');
    }
    // TODO persist long/lat to model.
    doResponse(response, {
        error:   0,
        message: 'Success',
        links:   links
    });
}

// Handle invalid requests e.g. bad endpoint, wrong method, or missing/invalid data.
function badRequest(request, response, message) {
    if (typeof message === 'undefined') {
        const { method, url } = request;
        message = `Bad request: ${method} '${url}'`;
    }
    log.warn(message);
    doResponse(response, {
        error:   1,
        message: message,
        links:   links
    });
}
