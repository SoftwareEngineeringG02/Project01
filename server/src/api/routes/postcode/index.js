/**
 * @module api/routes/postcode
 */
const http = require('http');

const controller = require(`${SERVER_ROOT}/api/controller`);
const log        = require(`${SERVER_ROOT}/server/log`);
const model      = require(`${SERVER_ROOT}/api/model`);
const routes     = require(`${SERVER_ROOT}/api/routes`);
const util       = require(`${SERVER_ROOT}/util`);

module.exports.REL    = 'get-postcode';

module.exports.METHOD = 'POST';

module.exports.CALLBACK = function(request, response) {
    log.debug(module.exports.REL);
    controller.getRequestBody(request, handleBody.bind(null, request, response));
};

function handleBody(request, response, error, body) {
    if (error) {
        return request.emit('error', error);
    }
    util.getJsonElements(
        body,
        {'id': 'string', 'time': 'number', 'longitude': 'number', 'latitude': 'number'},
        handleJson.bind(null, request, response)
    );
}

function handleJson(request, response, error, object) {
    if (error) {
        return request.emit('error', error);
    }
    const { id, time, longitude, latitude } = object;
    model.startRequest(
        request,
        id,
        time,
        getPostcode.bind(null, request, response, longitude, latitude)
    );
}

function getPostcode(request, response, longitude, latitude, error, requestID) {
    if (error) {
        return request.emit('error', error);
    }
    model.getPostcode(
        longitude,
        latitude,
        handlePostcode.bind(null, request, response, requestID)
    );
}

function handlePostcode(request, response, requestID, error, postcode) {
    if (error) {
        return request.emit('error', error);
    }
    // Send response.
    controller.doResponse(
        response,
        {
            'error':    0,
            'message':  'Success',
            'postcode': postcode,
            'links':    routes.endpoints
        },
        200,
        requestID
    );
}
