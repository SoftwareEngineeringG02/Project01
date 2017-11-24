/**
 * @module api/routes/postcode
 */

var http = require('http');

var controller = require(`${SERVER_ROOT}/api/controller`);
var log        = require(`${SERVER_ROOT}/server/log`);
var model      = require(`${SERVER_ROOT}/api/model`);
var routes     = require(`${SERVER_ROOT}/api/routes`);
var util       = require(`${SERVER_ROOT}/util`);

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
