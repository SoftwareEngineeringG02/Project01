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
    log.debug(module);
    // Try to extract `id` JSON property.
    controller.getRequestBody(request, (body) => {
        const object = util.getJsonElements(body, {'id': 'string'});
        if (typeof object !== 'object') {
            return controller.badRequest(request, response, result);
        }
        if (util.isNullOrUndefined(object.id)) {
            return controller.badRequest(request, response, 'Incomplete request');
        }
        const entry = model.getLocation(object.id);
        if (util.isNullOrUndefined(entry)) {
            return controller.badRequest(request, response, 'No data associated with ID');
        }
        const { longitude, latitude, time } = entry;
        // Send response.
        controller.doResponse(response, {
            'error':     0,
            'message':   'Success',
            'longitude': longitude,
            'latitude':  latitude,
            'time':      time,
            'links':     routes.endpoints
        });
    });
}
