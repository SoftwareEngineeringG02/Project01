/**
 * /location/update endpoint handler.
 * @module api/routes/location/update
 */

var controller = require(`${SERVER_ROOT}/api/controller`);
var log        = require(`${SERVER_ROOT}/server/log`);
var model      = require(`${SERVER_ROOT}/api/model`);
var routes     = require(`${SERVER_ROOT}/api/routes`);
var util       = require(`${SERVER_ROOT}/util`);

module.exports.REL    = 'set-location';

module.exports.METHOD = 'POST';

module.exports.INPUTS = {'id': 'string', 'longitude': 'number', 'latitude': 'number'};

module.exports.CALLBACK = function(inputs) {
    log.debug(module.exports.REL);
    return model.setLocation(inputs.id, inputs.longitude, inputs.latitude)
        .then(() => {
            return {
                'status': 200,
                'body': { 'error': 0, 'message': 'Success' }
            };
        })
    ;
}
