/**
 * /location endpoint handler.
 * @module api/routes/location/index
 */
const controller = require(`${SERVER_ROOT}/api/controller`);
const log        = require(`${SERVER_ROOT}/server/log`);
const model      = require(`${SERVER_ROOT}/api/model`);
const routes     = require(`${SERVER_ROOT}/api/routes`);
const util       = require(`${SERVER_ROOT}/util`);

module.exports.REL    = 'get-location'

module.exports.METHOD = 'POST';

module.exports.CALLBACK = function(request, response) {
    log.debug(module.exports.REL);
    controller.getRequestBody(request, handleBody.bind(null, request, response));
}

function handleBody(request, response, error, body) {
    if (error) {
        return request.emit('error', error);
    }
    util.getJsonElements(body, {'id': 'string'}, handleJson.bind(null, request, response));
}

function handleJson(request, response, error, object) {
    if (error) {
        return request.emit('error', error);
    }
    model.getLocation(object.id, handleLocation.bind(null, request, response));
}

function handleLocation(request, response, error, result) {
    if (error) {
        return request.emit('error', error);
    }
    const { longitude, latitude, time } = result;
    // Send response.
    controller.doResponse(response, {
        'error':     0,
        'message':   'Success',
        'longitude': longitude,
        'latitude':  latitude,
        'time':      time,
        'links':     routes.endpoints
    });
}
