/**
 * /location/list endpoint handler.
 * @module api/routes/location/list
 */
const controller = require(`${SERVER_ROOT}/api/controller`);
const log        = require(`${SERVER_ROOT}/server/log`);
const model      = require(`${SERVER_ROOT}/api/model`);
const routes     = require(`${SERVER_ROOT}/api/routes`);
const util       = require(`${SERVER_ROOT}/util`);

module.exports.REL    = 'list-location'

module.exports.METHOD = 'POST';

module.exports.CALLBACK = function(request, response) {
    log.trace(module.exports.REL);
    controller.getRequestBody(request, handleBody.bind(null, request, response));
 }

function handleBody(request, response, error, body) {
    if (error) {
        return request.emit('error', error);
    }
    util.getJsonElements(
        body,
        {id: 'string', time: 'number'},
        handleJson.bind(null, request, response)
    );
}

function handleJson(request, response, error, object) {
    if (error) {
        return request.emit('error', error);
    }
    const { id, time } = object;
    model.startRequest(request, id, time, getList.bind(null, request, response, id));
}

function getList(request, response, id, error, requestID) {
    if (error) {
        return request.emit('error', error);
    }
    model.listLocation(id, handleList.bind(null, request, response, requestID));
}

function handleList(request, response, requestID, error, results) {
    if (error) {
        return request.emit('error', error);
    }
    // Send response.
    controller.doResponse(
        response,
        {
            'error':   0,
            'message': 'Success',
            'results': results,
            'links':   routes.endpoints
        },
        200,
        requestID
    );
}
