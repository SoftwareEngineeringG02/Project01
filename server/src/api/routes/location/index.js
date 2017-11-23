/**
 * /location endpoint handler.
 * @module api/routes/location/index
 */

var controller = require(`${SERVER_ROOT}/api/controller`);
var log        = require(`${SERVER_ROOT}/server/log`);
var model      = require(`${SERVER_ROOT}/api/model`);
var routes     = require(`${SERVER_ROOT}/api/routes`);
var util       = require(`${SERVER_ROOT}/util`);

module.exports.REL    = 'get-location';

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
