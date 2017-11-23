/**
 * reverse-postcode endpoint
 * @module api/routes/postcode/reverse
 */
const http = require('http');

const controller = require(`${SERVER_ROOT}/api/controller`);
const log        = require(`${SERVER_ROOT}/server/log`);
const model      = require(`${SERVER_ROOT}/api/model`);
const routes     = require(`${SERVER_ROOT}/api/routes`);
const util       = require(`${SERVER_ROOT}/util`);

module.exports.REL    = 'reverse-postcode';

module.exports.METHOD = 'POST';

module.exports.CALLBACK = function(request, response) {
   log.debug(module.exports.REL);
   controller.getRequestBody(request, handleBody.bind(null, request, response));
};

function handleBody(request, response, error, body) {
   if (error) {
       return request.emit('error', error);
   }
   util.getJsonElements(
       body,
       {'id': 'string', 'time': 'number', 'postcode': 'string'},
       handleJson.bind(null, request, response)
   );
}

function handleJson(request, response, error, object) {
   if (error) {
       return request.emit('error', error);
   }
   const { id, time, postcode } = object;
   model.startRequest(
       request,
       id,
       time,
       reversePostcode.bind(null, request, response, postcode)
   );
}

function reversePostcode(request, response, postcode, error, requestID) {
   if (error) {
       return request.emit('error', error);
   }
   model.reversePostcode(
       postcode,
       handleLonLat.bind(null, request, response, requestID)
   );
}

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
