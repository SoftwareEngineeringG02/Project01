/**
 * /price endpoint handler.
 * @module api/routes/price/index
 */
const controller = require(`${SERVER_ROOT}/api/controller`);
const log        = require(`${SERVER_ROOT}/server/log`);
const model      = require(`${SERVER_ROOT}/api/model`);
const routes     = require(`${SERVER_ROOT}/api/routes`);
const util       = require(`${SERVER_ROOT}/util`);

module.exports.REL      = 'get-price';

module.exports.METHOD   = 'POST';

module.exports.INPUTS   = { 'id': 'string', 'longitude': 'number', 'latitude': 'number' };

module.exports.CALLBACK = function(inputs) {
    log.debug(module.exports.REL);
    const { longitude, latitude } = inputs;
    return model.getPrice(longitude, latitude)
        .then(price => {
            if (util.isNullOrUndefined(price)) {
                return Promise.reject(new util.ServerError(`No data for (${longitude},${latitude})`));
            }
            return [
                200,
                {
                    'error':   0,
                    'message': 'Success',
                    'price':   price
                }
            ];
        })
    ;
}
