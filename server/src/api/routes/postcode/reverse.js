/**
 * reverse-postcode endpoint
 * @module api/routes/postcode/reverse
 */

var http = require('http');

var controller = require(`${SERVER_ROOT}/api/controller`);
var log        = require(`${SERVER_ROOT}/server/log`);
var model      = require(`${SERVER_ROOT}/api/model`);
var routes     = require(`${SERVER_ROOT}/api/routes`);
var util       = require(`${SERVER_ROOT}/util`);

module.exports.REL      = 'reverse-postcode';

module.exports.METHOD   = 'POST';

module.exports.INPUTS   = {'id': 'string', 'postcode': 'string'};

module.exports.CALLBACK = function({postcode}) {
    log.debug(module.exports.REL);
    return model.reversePostcode(postcode)
        .then(({longitude, latitude}) => {
            return {
                'status': 200,
                'body': {
                    'error':     0,
                    'message':   'Success',
                    'longitude': longitude,
                    'latitude':  latitude
                }
            };
        })
    ;
};

function handleLonLat(request, response, requestID, error, longitude, latitude) {
   if (error) {
       return request.emit('error', error);
   }
   // Send response.
   controller.doResponse(
       response,
       {
           'error':    0,
           'message':  'Success',
           'longitude': longitude,
           'latitude':  latitude,
           'links':     routes.endpoints
       },
       200,
       requestID
   );
}
