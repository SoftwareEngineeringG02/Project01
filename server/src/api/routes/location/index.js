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

module.exports.INPUTS = {'id': 'string'};

module.exports.CALLBACK = function(inputs) {
    log.debug(module.exports.REL);
    return model.getLocation(inputs.id)
        .then(location => {
            if (util.isNullOrUndefined(location)) {
                Promise.reject(new util.ServerError('No location data associated with client'));
            }
            return {
                'status': 200,
                'body': {
                    'error':     0,
                    'message':   'Success',
                    'longitude': location.longitude,
                    'latitude':  location.latitude,
                }
            };
        })
    ;
}
