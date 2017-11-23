/**
 * Server API model.
 * @module api/model
 */
const https = require('https');

const database = require(`${SERVER_ROOT}/database/mysql.js`);
const log      = require(`${SERVER_ROOT}/server/log`);
const util     = require(`${SERVER_ROOT}/util`);

module.exports.startRequest    = startRequest;
module.exports.endRequest      = endRequest;
module.exports.getLocation     = getLocation;
module.exports.listLocation    = listLocation;
module.exports.setLocation     = setLocation;
module.exports.getPrice        = getPrice;
module.exports.getPriceMap     = getPriceMap;
module.exports.getPostcode     = getPostcode;
module.exports.reversePostcode = reversePostcode;

// Tables.
const TADDRESS  = 'address';
const TCLIENT   = 'client';
const TREQUEST  = 'request';
const TLOCATION = 'location';
const TPRICE    = 'price';

/**
 * Persist a request to the database.
 * @param request The HTTP request.
 * @param client The client ID.
 */
function startRequest(request, client) {
    log.trace(module, startRequest);
    // Extract & log client details.
    const { method, url, headers } = request;
    const address = request.connection.remoteAddress;
    const agent   = headers['user-agent'];
    log.info(`Request <address=${address}, request=${method} ${url}, user-agent=${agent}>`);
    const all = Promise.all([
        database.insertIgnore(TCLIENT, {'id': client}),
        database.insert(TADDRESS, { 'client': client, 'address': address, 'agent': agent }),
        database.insert(
            TREQUEST,
            {
                'client':    client,
                'url':       url,
                'method':    method,
                'server':    util.getLocalAddress(),
                'startTime': new Date().getTime()
            }
        )
    ]);
    return all.then(results => {
        return results[2].insertId;
    })
        .catch(onDBError)
    ;
}

/**
 * Finalise a request in the database.
 * @param requestID The request ID: @see startRequest
 * @param status The status when ending the request (0: success, 1: error).
 */
function endRequest(requestID, status) {
    log.trace(module, endRequest);
    return database.update(
        TREQUEST,
        equal('id', requestID),
        {
            'endTime': new Date().getTime(),
            'status':  status
        }
    ).catch(onDBError);
}

/**
 * Get the most recent location data associated with an ID, if available.
 * @param client  The client ID.
 */
function getLocation(client) {
    log.trace(module, getLocation);
    return database.find(TLOCATION, equal('client', client), sortBy='client', descending=true)
        .then(rows => rows[0])
        .catch(onDBError)
    ;
}

/**
 * List locations associated with an ID.
 * @param client The client ID.
 */
function listLocation(client) {
    log.trace(module, listLocation);
    return database.find(TLOCATION, equal('client', client))
        .catch(onDBError)
    ;
}

/**
 * Persist location data.
 * @param client The client ID.
 * @param time The POSIX timestamp.
 * @param longitude The longitude.
 * @param latitude The latitude.
 */
function setLocation(client, longitude, latitude) {
    log.trace(module, setLocation);
    return database.insert(
        TLOCATION,
        {
            'client':    client,
            'longitude': longitude,
            'latitude':  latitude
        }
    ).catch(onDBError);
}

/**
 * Retrieve price for longitude and latitude.
 * @param longitude The longitude.
 * @param latitude The latitude.
 * @param callback A function to call when results are ready. Arguments are (error, results).
 */
function getPrice(longitude, latitude) {
    log.trace(module, getPrice);
    // Longitudes and latitudes in the DB are precise to 13 decimal places. 10^-12 of a degree is
    // about 6.5 nm, which means the server won't return anything unless the user stands in a very
    // specific spot. To fix this, we allow a tolerance of 10^-6 degrees, which is about 11 m. We
    // then log how many results this returns (for debugging) and return the first (and hopefully
    // only) result.
    const R10M   = 10e-6;
    const lonMin = longitude - R10M;
    const lonMax = longitude + R10M;
    const latMin = latitude  - R10M;
    const latMax = latitude  + R10M;
    return getPriceMap(lonMin, lonMax, latMin, latMax)
        .then(map => {
            // Find the entry closest to longitude and latitude.
            var closest = 0;
            var minDiff = Math.sqrt(Math.pow(longitude - map[0].longitude, 2) + Math.pow(latitude - map[0].latitude, 2));
            for (var i = 1; i < map.length; ++i) {
                const diff = Math.sqrt(Math.pow(longitude - map[i].longitude, 2) + Math.pow(latitude - map[i].latitude, 2));
                if (diff < minDiff) {
                    closest = i;
                    minDiff = diff;
                }
            }
            return map[closest].price;
        });
}

/**
 * Get a list of rows where longitude and latitude are within [lonMin,lonMax] and [latMin,latMax]
 * respectively.
 */
function getPriceMap(lonMin, lonMax, latMin, latMax) {
    log.trace(module, getPriceMap);
<<<<<<< HEAD
    const search = and(and(gteq('longitude', lonMin), lteq('longitude', lonMax)),
                       and(gteq('latitude',  latMin),  lteq('latitude',  latMax)));
    database.find(TPRICE, search, (error, results) => {
        if (results) {
            log.debug(`${results.length} results`);
        }
        callback(error, results);
    });
}

function equal(lhs, rhs) { return { lhs, op: '=',   rhs }; }
function gteq(lhs,  rhs) { return { lhs, op: '>=',  rhs }; }
function lteq(lhs,  rhs) { return { lhs, op: '<=',  rhs }; }
function and(lhs,   rhs) { return { lhs, op: 'and', rhs }; }

/**
 * Get a postcode from a longitude/latitude.
 * @param longitude
 * @param latitude
 * @param callback A function(error, postcode) to call when results are ready.
 */
function getPostcode(longitude, latitude, callback) {
    // First try to pull the postcode from the local database.
    database.find(
        TPRICE,
        and(equal('longitude', longitude), equal('latitude', latitude)),
        handleDBPostcode.bind(null, longitude, latitude, callback),
        column='postcode'
    );
}

function handleDBPostcode(longitude, latitude, callback, error, results) {
    if (error) {
        callback(error);
    } else if (results && results[0] && results[0] && results[0].postcode) {
        callback(null, results[0].postcode);
    } else {
        // FIXME lon/lat are reversed in database.
        // Try to get the postcode from the internet.
        getPostcodeOnline(latitude, longitude, callback);
    }
}

function getPostcodeOnline(longitude, latitude, callback) {
    const HOSTNAME = 'https://api.postcodes.io';
    const ENDPOINT = '/postcodes';
    var request = https.get(
        `${HOSTNAME}/${ENDPOINT}?lon=${longitude}&lat=${latitude}&limit=1`,
        handleOnlinePostcode.bind(null, longitude, latitude, callback)
    );
}

function handleOnlinePostcode(longitude, latitude, callback, response) {
    var data = '';
    response.on('data', chunk => { data += chunk; });
    response.on('end', () => {
        try {
            const object = JSON.parse(data);
            if (object && object.result && object.result[0] && object.result[0].postcode) {
                return callback(null, object.result[0].postcode);
            }
            return callback(new Error('Could not find postcode'));
        } catch (error) {
            return callback(error);
        }
    });
}

/**
 * Get a longitude and latitude from a postcode.
 * @param postcode The postcode.
 * @param callback A function(error, longitude, latitude) to call when results are ready.
 */
function reversePostcode(postcode, callback) {
    // First try to find the longitude and latitude in the local database.
    database.find(
        TPRICE,
        { lhs: 'postcode', op: '=', rhs: postcode },
        handleDBLonLat.bind(null, postcode, callback),
        column=['longitude','latitude']
    );
}

function handleDBLonLat(postcode, callback, error, results) {
    if (error) {
        callback(error);
    } else if (results && results[0] && results[0].longitude && results[0].latitude) {
        callback(null, results[0].longitude, results[0].latitude)
    } else {
        // Use online service to get result.
        getLonLatOnline(postcode, callback);
    }
}

function getLonLatOnline(postcode, callback) {
    const HOSTNAME = 'https://api.postcodes.io';
    const ENDPOINT = '/postcodes';
    var request = https.get(
        `${HOSTNAME}/${ENDPOINT}?query=${postcode}`,
        handleOnlineLonLat.bind(null, postcode, callback)
    );
}

function handleOnlineLonLat(postcode, callback, response) {
    var data = '';
    response.on('data', chunk => { data += chunk; });
    response.on('end', () => {
        try {
            const object = JSON.parse(data);
            if (object && object.result && object.result[0] && object.result[0].longitude && object.result[0].latitude) {
                // FIXME lon/lat are reversed in database.
                return callback(null, object.result[0].latitude, object.result[0].longitude);
            }
            return callback(new Error('Could not find postcode'));
        } catch (error) {
            return callback(error);
        }
    });
=======
    const search = { lhs: { lhs: { lhs: 'longitude', op: '>=', rhs: lonMin },
                            op:  'and',
                            rhs: { lhs: 'longitude', op: '<=', rhs: lonMax } },
                     op:  'and',
                     rhs: { lhs: { lhs: 'latitude', op: '>=', rhs: latMin },
                            op:  'and',
                            rhs: { lhs: 'latitude', op: '<=', rhs: latMax } } };
    return database.find(TPRICE, search)
        .catch(onDBError)
    ;
>>>>>>> promise
}

function onDBError(error) {
    log.error(error.message);
    const newError = new util.ServerError('Database error');
    newError.stack = error.stack;
    return newError;
}

function equal(lhs, rhs) { return { lhs, op: '=',   rhs }; }
function gteq(lhs,  rhs) { return { lhs, op: '>=',  rhs }; }
function lteq(lhs,  rhs) { return { lhs, op: '<=',  rhs }; }
function and(lhs,   rhs) { return { lhs, op: 'and', rhs }; }
