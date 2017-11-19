/**
 * /location/list endpoint handler.
 * @module api/routes/location/list
 */
const controller = require(`${SERVER_ROOT}/api/controller`);
const log        = require(`${SERVER_ROOT}/server/log`);
const model      = require(`${SERVER_ROOT}/api/model`);
const routes     = require(`${SERVER_ROOT}/api/routes`);

module.exports.REL    = 'list-location'

module.exports.METHOD = 'POST';

module.exports.CALLBACK = function(request, response) {
    log.trace(module.exports.REL);
    // Try to extract `id` JSON property.
    controller.getRequestBody(request, (body) => {
        const object = util.getJsonElements(body, {'id': 'string'});
        if (typeof object !== 'object') {
            return controller.badRequest(request, response, result);
        }
        if (util.isNullOrUndefined(object.id)) {
            return controller.badRequest(request, response, 'Incomplete request');
        }
        model.listLocation(object.id, (error, result) => {
            if (error) {
                throw error;
            }
            if (util.isNullOrUndefined(result)) {
                return controller.badRequest(request, response, 'No data associated with ID');
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
        });
    });
 }
