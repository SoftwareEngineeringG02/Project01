/**
 * /price endpoint handler.
 * @module api/routes/price/index
 */

var controller = require(`${SERVER_ROOT}/api/controller`);
var log        = require(`${SERVER_ROOT}/server/log`);
var model      = require(`${SERVER_ROOT}/api/model`);
var routes     = require(`${SERVER_ROOT}/api/routes`);
var util       = require(`${SERVER_ROOT}/util`);

module.exports.REL      = 'get-price';

module.exports.METHOD   = 'POST';

module.exports.INPUTS   = { 'id': 'string', 'longitude': 'number', 'latitude': 'number' };

module.exports.CALLBACK = function(inputs) {
    log.debug(module.exports.REL);
    const { longitude, latitude } = inputs;
    return model.getPrice(longitude, latitude)
        .then(price => {
            var error   = 0;
            var message = 'Success';
            if (util.isNullOrUndefined(price)) {
                error = 1;
                message = 'No Data';
                price = 'No Data';
            }
            return {
                'status': 200,
                'body': {
                    'error':   error,
                    'message': message,
                    'price':   price
                }
            };
        })
    ;
}
