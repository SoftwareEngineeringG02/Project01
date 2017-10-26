/**
 * / endpoint handler.
 * @module api/routes/index
 */
const controller = require(`${SERVER_ROOT}/api/controller`);
const log        = require(`${SERVER_ROOT}/server/log`);
const routes     = require(`${SERVER_ROOT}/api/routes`);

module.exports.REL    = 'index'

module.exports.METHOD = 'GET';

module.exports.CALLBACK = index;

function index(request, response) {
    log.debug(module);
    return controller.doResponse(response, {
        'error':   0,
        'message': 'Success',
        'links':    routes.endpoints
    });
}
