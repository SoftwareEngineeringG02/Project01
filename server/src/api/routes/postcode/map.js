/**
 * @module api/routes/postcode/map
 */

var http = require('http');

var controller = require(`${SERVER_ROOT}/api/controller`);
var log        = require(`${SERVER_ROOT}/server/log`);
var model      = require(`${SERVER_ROOT}/api/model`);
var routes     = require(`${SERVER_ROOT}/api/routes`);
var util       = require(`${SERVER_ROOT}/util`);

module.exports.REL    = 'get-postcode-map';

module.exports.METHOD = 'POST';

module.exports.INPUTS = { id: 'string', 'postcode': 'string' };

module.exports.CALLBACK = function({postcode}) {
    log.debug(module.exports.REL);
    return model.getPostcodeMap(postcode)
        .then(map => {
            if (util.isNullOrUndefined(map)) {
                return Promise.reject(new util.ServerError(`No data for postcode ${postcode}`));
            }
            return {
                'status': 200,
                'body': {
                    'error':   0,
                    'message': 'Success',
                    'map':     map
                }
            };
        })
    ;
};
