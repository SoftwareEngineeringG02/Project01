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
    controller.getRequestBody(request, handleBody.bind(null, request, response));
}

function handleBody(request, response, error, body) {
    if (error) {
        return request.emit('error', error)
    }
    const elems = {
        id:        'string',
        time:      'number',
        longitude: 'number',
        latitude:  'number',
        radius:    'number'
    };
    util.getJsonElements(body, elems, handleJson.bind(null, request, response));
}

function handleJson(request, response, error, object) {
    if (error) {
        return request.emit('error', error)
    }
    const { id, time, longitude, latitude, radius } = object;
    model.startRequest(
        request,
        id,
        time,
        getPriceMap.bind(null, request, response, longitude, latitude, radius)
    );
}

function getPriceMap(request, response, longitude, latitude, radius, error, requestID) {
    if (error) {
        return request.emit('error', error)
    }
    const EARTH_RADIUS = 6371e3; // metres.
    const radRadius    = radius/EARTH_RADIUS; // Convert distance to radians.
    const { lonMin, lonMax, latMin, latMax } = lonLatBounds(longitude, latitude, radRadius);
    model.getPriceMap(
        lonMin,
        lonMax,
        latMin,
        latMax,
        handlePriceMap.bind(null, request, response, requestID)
    );
}

function handlePriceMap(request, response, requestID, error, results) {
    if (error) {
        return request.emit('error', error);
    }
    // Return the results.
    controller.doResponse(
        response,
        {
            'error':   0,
            'message': 'Success',
            'map':     results,
            'links':   routes.endpoints
        },
        200,
        requestID
    );
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
        latMax: latitude  + radius
    }
}
