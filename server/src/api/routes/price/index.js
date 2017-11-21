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
    const elems = {'longitude': 'number', 'latitude': 'number'};
    util.getJsonElements(body, elems, handleJson.bind(null, request, response));
}

function handleJson(request, response, error, object) {
    if (error) {
        return request.emit('error', error);
    }
    model.getPrice(
        object.longitude,
        object.latitude,
        handlePrice.bind(null, request, response)
    );
}

// Return price in response.
function handlePrice(request, response, error, result) {
    if (error) {
        return request.emit('error', error);
    }
    if (util.isNullOrUndefined(result)) {
        return request.emit('error', 'No data associated with ID');
    }
    // Send response.
    controller.doResponse(response, {
        'error':   0,
        'message': 'Success',
        'price':   result.price,
        'links':   routes.endpoints
    });
};
