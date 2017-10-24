'use strict';

const log   = require('../server/log');
const model = require('./model');

const links = [
    { rel: 'index',        href: '/',                handler: index       },
    { rel: 'get-location', href: '/location',        handler: getLocation },
    { rel: 'set-location', href: '/location/update', handler: setLocation }
];

function doResponse(response, json) {
    response.setHeader('Content-Type', 'application/json');
    response.end(JSON.stringify(json));
}

function index(request, response) {
    doResponse(response, {
        error:   0,
        message: 'Success',
        links:   links
    });
}

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
    return badRequest(request, response);
}
