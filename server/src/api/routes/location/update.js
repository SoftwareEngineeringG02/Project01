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

module.exports.INPUTS = {'id': 'string', 'longitude': 'number', 'latitude': 'number'};

module.exports.CALLBACK = function(inputs) {
    log.debug(module.exports.REL);
    return model.setLocation(inputs.id, inputs.longitude, inputs.latitude)
        .then(() => [ 200, { 'error': 0, 'message': 'Success' } ])
    ;
}
