/**
 * /price/map endpoint handler.
 * @module api/routes/price/map
 */
const controller = require(`${SERVER_ROOT}/api/controller`);
const log        = require(`${SERVER_ROOT}/server/log`);
const model      = require(`${SERVER_ROOT}/api/model`);
const routes     = require(`${SERVER_ROOT}/api/routes`);
const util       = require(`${SERVER_ROOT}/util`);

module.exports.REL      = 'get-price-map';

module.exports.METHOD   = 'POST';

module.exports.INPUTS   = {
    'id':        'string',
    'longitude': 'number',
    'latitude':  'number',
    'radius':    'number'
};

module.exports.CALLBACK = function({longitude, latitude, radius}) {
    log.debug(module.exports.REL);
    // Get price map.
    return model.getPriceMap(longitude, latitude, radius)
        .then(map => {
            if (util.isNullOrUndefined(map)) {
                return Promise.reject(new util.ServerError(`No data within radius ${radius} of (${longitude},${latitude})`));
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
}
