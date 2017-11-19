/**
 * /price endpoint handler.
 * @module api/routes/price/index
 */
const controller = require(`${SERVER_ROOT}/api/controller`);
const log        = require(`${SERVER_ROOT}/server/log`);
const model      = require(`${SERVER_ROOT}/api/model`);
const routes     = require(`${SERVER_ROOT}/api/routes`);
const util       = require(`${SERVER_ROOT}/util`);

module.exports.REL    = 'get-price';
module.exports.METHOD = 'POST';

module.exports.CALLBACK = function(request, response) {
    log.debug(module.exports.REL);
    // Try to extract `id` JSON property.
    controller.getRequestBody(request, (body) => {
        const object = util.getJsonElements(body, {'longitude': 'number', 'latitude': 'number'});
        if (typeof object !== 'object') {
            return controller.badRequest(request, response, result);
        }
        const { longitude, latitude } = object;
        model.getPrice(longitude, latitude, (error, result) => {
            if (error) {
                throw error;
            }
            if (util.isNullOrUndefined(result)) {
                return controller.badRequest(request, response, 'No data associated with ID');
            }
            // Send response.
            controller.doResponse(response, {
                'error':     0,
                'message':   'Success',
                'price':     result.price,
                'links':     routes.endpoints
            });
        });
    });
}
