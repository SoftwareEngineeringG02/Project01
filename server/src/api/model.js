/**
 * Server API model.
 * @module api/model
 */
const database = require(`${global.SERVER_ROOT}/database/mysql.js`);
const log      = require(`${global.SERVER_ROOT}/server/log`);
const util     = require(`${global.SERVER_ROOT}/util`);

// Table containing price data.
const TPRICE    = 'price';
// Table containing location data.
const TLOCATION = 'location';

/**
 * Get the most recent location data associated with an ID, if available.
 * @param id The ID string, e.g. a phone number.
 * @param callback A function to call when results are ready. Arguments are (error, results).
 */
function getLocation(id, callback) {
    log.trace(module, getLocation);
    database.find(TLOCATION, { lhs: 'id', op: '=', rhs: id }, preCallback, 'time');
    function preCallback(error, rows) {
        if (util.isNullOrUndefined(rows) || rows.length == 0) {
            callback(error, null);
        } else {
            callback(error, rows[0]);
        }
    }
}

function listLocation(id, callback) {
    log.trace(module, listLocation);
    database.find(TLOCATION, { lhs: 'id', op: '=', rhs: id}, callback);
}


/**
 * Persist location data.
 * @param id The ID string.
 * @param time The POSIX timestamp.
 * @param longitude The longitude.
 * @param latitude The latitude.
 * @param callback A function to call when results are ready. Arguments are (error, results).
 */
function setLocation(id, time, longitude, latitude, callback) {
    log.trace(module, setLocation);
    database.insert(TLOCATION, {
        'id':        id,
        'time':      time,
        'longitude': longitude,
        'latitude':  latitude
    }, callback);
}

/**
 * Retrieve price for longitude and latitude.
 * @param longitude The longitude.
 * @param latitude The latitude.
 * @param callback A function to call when results are ready. Arguments are (error, results).
 */
function getPrice(longitude, latitude, callback) {
    log.trace(module, getPrice);
    // Longitudes and latitudes in the DB are precise to 13 decimal places. 10^-12 of a degree is
    // about 6.5 nm, which means the server won't return
    // To fix
    // this, we allow a tolerance of 10^-6 degrees, which is about 11 m. We then log how many
    // results this returns (for debugging) and return the first (and hopefully only) result.
    const R10M   = 1e-6;
    const lonMin = longitude - R10M;
    const lonMax = longitude + R10M;
    const latMin = latitude  - R10M;
    const latMax = latitude  + R10M;
    getPriceMap(lonMin, lonMax, latMin, latMax, (error, results) => {
        var count = 0;
        if (results) {
            count   = results.length;
            results = results[0];
        }
        log.debug(`${count} results within ${R10M} radius of (${latitude},${longitude})`);
        callback(error, results);
    });
}

/**
 * Get a list of rows where longitude and latitude are within [lonMin,lonMax] and [latMin,latMax]
 * respectively.
 */
function getPriceMap(lonMin, lonMax, latMin, latMax, callback) {
    log.trace(module, getPriceMap);
    const search = { lhs: { lhs: { lhs: 'longitude', op: '>=', rhs: lonMin },
                            op:  'and',
                            rhs: { lhs: 'longitude', op: '<=', rhs: lonMax } },
                     op:  'and',
                     rhs: { lhs: { lhs: 'latitude', op: '>=', rhs: latMin },
                            op:  'and',
                            rhs: { lhs: 'latitude', op: '<=', rhs: latMax } } };
    database.find(TPRICE, search, callback);
}


module.exports.getLocation  = getLocation;
module.exports.listLocation = listLocation;
module.exports.setLocation  = setLocation;
module.exports.getPrice     = getPrice;
module.exports.getPriceMap  = getPriceMap;
