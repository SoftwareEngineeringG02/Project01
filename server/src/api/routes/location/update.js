/**
 * /location/update endpoint handler.
 * @module api/routes/location/update
 */
const controller = require(`${SERVER_ROOT}/api/controller`);
const log        = require(`${SERVER_ROOT}/server/log`);
const model      = require(`${SERVER_ROOT}/api/model`);
const routes     = require(`${SERVER_ROOT}/api/routes`);
const util       = require(`${SERVER_ROOT}/util`);

module.exports.REL    = 'set-location'

module.exports.METHOD = 'POST';

module.exports.CALLBACK = function(request, response) {
    log.debug(module.exports.REL);
    controller.getRequestBody(request, handleBody.bind(null, request, response));
}

function handleBody(request, response, error, body) {
    if (error) {
        return request.emit('error', error);
    }
    const elems = {
        id:        'string',
        time:      'number',
        longitude: 'number',
        latitude:  'number'
    };
    util.getJsonElements(body, elems, handleJson.bind(null, request, response));
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
        setLocation.bind(null, request, response, id, longitude, latitude)
    );
}

function setLocation(request, response, id, longitude, latitude, error, requestID) {
    if (error) {
        return request.emit('error', error);
    }
    model.setLocation(
        id,
        longitude,
        latitude,
        handleLocation.bind(null, request, response, requestID)
    );
}

function handleLocation(request, response, requestID, error, results) {
    if (error) {
        return request.emit('error', error);
    }
    controller.doResponse(
        response,
        {
            'error':   0,
            'message': 'Success',
            'links':   routes.endpoints
        },
        200,
        requestID
    );
}
