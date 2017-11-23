/**
 * @module api/routes/postcode/map
 */
const http = require('http');

const controller = require(`${SERVER_ROOT}/api/controller`);
const log        = require(`${SERVER_ROOT}/server/log`);
const model      = require(`${SERVER_ROOT}/api/model`);
const routes     = require(`${SERVER_ROOT}/api/routes`);
const util       = require(`${SERVER_ROOT}/util`);

module.exports.REL    = 'get-postcode-map';

module.exports.METHOD = 'POST';

module.exports.INPUTS = { id: 'string', 'postcode': 'string', 'radius': 'number' };

module.exports.CALLBACK = function({postcode, radius}) {
    log.debug(module.exports.REL);
    return model.getPostcodeMap(postcode, radius)
        .then(map => {
            return {
                'status': 200,
                'map':    map,
                'body': {
                    'error':    0,
                    'message':  'Success',
                    'postcode': postcode
                }
            };
        })
    ;
};
