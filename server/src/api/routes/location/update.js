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
    log.debug(module);
    // Try to extract `id`, `time`, `longitude` and `latitude` JSON properties.
    const elems = {
        id:        'string',
        time:      'number',
        longitude: 'number',
        latitude:  'number'
    };
    controller.getRequestBody(request, (body) => {
        const object = util.getJsonElements(body, elems);
        if (typeof object !== 'object' || object == null) {
            return controller.badRequest(request, response);
        }
        const { id, time, longitude, latitude } = object;
        if (util.isNullOrUndefined(id)
         || util.isNullOrUndefined(time)
         || util.isNullOrUndefined(longitude)
         || util.isNullOrUndefined(latitude)) {
            return controller.badRequest(request, response, 'Incomplete request');
        }
        // Persist the values to the model.
        model.setLocation(id, time, longitude, latitude);
        controller.doResponse(response, {
            'error':   0,
            'message': 'Success',
            'links':   routes.endpoints
        });
    });
}
