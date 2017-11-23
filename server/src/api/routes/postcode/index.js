/**
 * @module api/routes/postcode
 */
const http = require('http');

const controller = require(`${SERVER_ROOT}/api/controller`);
const log        = require(`${SERVER_ROOT}/server/log`);
const model      = require(`${SERVER_ROOT}/api/model`);
const routes     = require(`${SERVER_ROOT}/api/routes`);
const util       = require(`${SERVER_ROOT}/util`);

module.exports.REL    = 'get-postcode';

module.exports.METHOD = 'POST';

module.exports.INPUTS = { id: 'string', 'longitude': 'number', 'latitude': 'number' };

module.exports.CALLBACK = function({longitude, latitude}) {
    log.debug(module.exports.REL);
    return model.getPostcode(longitude, latitude)
        .then(postcode => {
            return {
                'status': 200,
                'body': {
                    'error':    0,
                    'message':  'Success',
                    'postcode': postcode
                }
            };
        })
    ;
};
