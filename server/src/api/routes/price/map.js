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

module.exports.CALLBACK = function(inputs) {
    log.debug(module.exports.REL);
    // Compute boundaries.
    // FIXME: longitude and latidude and reversed.
    const { longitude, latitude, radius } = inputs;
    const EARTH_RADIUS = 6371e3; // metres.
    const radRadius    = radius/EARTH_RADIUS; // Convert distance to radians.
    const { lonMin, lonMax, latMin, latMax } = lonLatBounds(longitude, latitude, radRadius);
    // Get price map.
    return model.getPriceMap(lonMin, lonMax, latMin, latMax)
        .then(map => {
            if (util.isNullOrUndefined(map)) {
                return Promise.reject(new util.ServerError(`No data within radius ${radius} of (${longitude},${latitude})`));
            }
            return [
                200,
                {
                    'error':   0,
                    'message': 'Success',
                    'map':     map
                }
            ];
        })
    ;
}

// Compute the minimum and maximum longitude and latitude of points within a radius of a given point
// Based on http://janmatuschek.de/LatitudeLongitudeBoundingCoordinates
function lonLatBounds(longitude, latitude, radius) {
    // Compute Δlongitude.
    const latT = Math.asin(Math.sin(latitude)/Math.cos(radius));
    const dlon = Math.acos((Math.cos(radius) - Math.sin(latT)*Math.sin(latitude))/(Math.cos(latT)/Math.cos(latitude)));
    // Return results.
    return {
        lonMin: longitude - radius,
        lonMax: longitude + radius,
        latMin: latitude  - dlon,
        latMax: latitude  + dlon
    }
}
