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
     log.debug(module);
     return controller.doResponse(response, {
         'error':   1,
         'message': 'Not implemented yet',
         'links':   routes.endpoints
     });
 }
