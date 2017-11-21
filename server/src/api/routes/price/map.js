/**
 * /price/map endpoint handler.
 * @module api/routes/price/map
 */
const controller = require(`${SERVER_ROOT}/api/controller`);
const log        = require(`${SERVER_ROOT}/server/log`);
const model      = require(`${SERVER_ROOT}/api/model`);
const routes     = require(`${SERVER_ROOT}/api/routes`);
const util       = require(`${SERVER_ROOT}/util`);

module.exports.REL    = 'get-price-map';

module.exports.METHOD = 'POST';

module.exports.CALLBACK = function(request, response) {
    log.debug(module.exports.REL);
    // Process request body.
    controller.getRequestBody(request, (body) => {
        // Try to extract `longitude`, `latitude` and 'radius' JSON properties.
        const elems = {
            longitude: 'number',
            latitude:  'number',
            radius:    'number'
        };
        const object = util.getJsonElements(body, elems);
        if (typeof object !== 'object' || object == null) {
            return controller.badRequest(request, response);
        }
        const { longitude, latitude, radius } = object;
        if (util.isNullOrUndefined(longitude)
         || util.isNullOrUndefined(latitude)
         || util.isNullOrUndefined(radius)) {
            return controller.badRequest(request, response, 'Incomplete request');
        }
        // Find all the data within the radius.
        const EARTH_RADIUS = 6371e3; // metres.
        const radRadius = radius/EARTH_RADIUS; // Convert distance to radians.
        const { lonMin, lonMax, latMin, latMax } = lonLatBounds(longitude, latitude, radRadius);
        model.getPriceMap(lonMin, lonMax, latMin, latMax, (error, results) => {
            if (error) {
                throw error;
            }
            // Return the results.
            controller.doResponse(response, {
                'error':   0,
                'message': 'Success',
                'map':     results,
                'links':   routes.endpoints
            });
        });
    });
}

// Compute the minimum and maximum longitude and latitude of points within a radius of a given point
// Based on http://janmatuschek.de/LatitudeLongitudeBoundingCoordinates
function lonLatBounds(longitude, latitude, radius) {
    // Compute Δlongitude.
    const latT = Math.asin(Math.sin(latitude)/Math.cos(radius));
    const dlon = Math.acos((Math.cos(radius) - Math.sin(latT)*Math.sin(latitude))/(Math.cos(latT)/Math.cos(latitude)));
    // Return results.
    return {
        lonMin: longitude - dlon,
        lonMax: longitude + dlon,
        latMin: latitude  - radius,
        latMax: latitude  + radius,
    }
}
