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

module.exports.INPUTS = {'id': 'string'};

module.exports.CALLBACK = function(inputs) {
    log.debug(module.exports.REL);
    return model.listLocation(inputs.id)
        .then(results => {
            if (util.isNullOrUndefined(results)) {
                return Promise.reject(new util.ServerError('No location data associated with client'));
            }
            return [
                200,
                {
                    'error':   0,
                    'message': 'Success',
                    'results': results
                }
            ];
        })
    ;
}
