/**
 * /price endpoint handler.
 * @module api/routes/price/index
 */
const controller = require(`${SERVER_ROOT}/api/controller`);
const log        = require(`${SERVER_ROOT}/server/log`);
const model      = require(`${SERVER_ROOT}/api/model`);
const routes     = require(`${SERVER_ROOT}/api/routes`);
const util       = require(`${SERVER_ROOT}/util`);

module.exports.REL      = 'get-price';

module.exports.METHOD   = 'POST';

module.exports.CALLBACK = function(request, response) {
    log.debug(module.exports.REL);
    controller.getRequestBody(request, handleBody.bind(null, request, response));
}

// Handle body data.
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
        getPrice.bind(null, request, response, longitude, latitude)
    );
}

function getPrice(request, response, longitude, latitude, error, requestID) {
    if (error) {
        return request.emit('error', error);
    }
    model.getPrice(
        longitude,
        latitude,
        handlePrice.bind(null, request, response, requestID)
    );
}

// Return price in response.
function handlePrice(request, response, requestID, error, result) {
    if (error) {
        return request.emit('error', error);
    }
    if (util.isNullOrUndefined(result)) {
        return request.emit('error', 'No price associated with location');
    }
    // Send response.
    controller.doResponse(
        response,
        {
            'error':   0,
            'message': 'Success',
            'price':   result.price,
            'links':   routes.endpoints
        },
        200,
        requestID
    );
};
