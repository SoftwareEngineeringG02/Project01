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
const TCLIENT   = 'client';
const TREQUEST  = 'request';
const TLOCATION = 'location';
const TPRICE    = 'price';

/**
 * Persist a request to the database.
 * @param request The HTTP request.
 * @param id The client ID.
 * @param time The request timestamp.
 * @param callback A function(error, requestID) to call when done.
 */
function startRequest(request, id, time, callback) {
    log.trace(module, startRequest);
    // Extract & log client details.
    const { method, url, headers } = request;
    const address = request.connection.remoteAddress;
    const agent   = headers['user-agent'];
    log.info(`Request <address=${address}, request=${method} ${url}, user-agent=${agent}>`);
    // Save client info.
    database.insert(
        TCLIENT,
        {'id': id, 'address': address, 'agent': agent, 'time': time },
        saveRequest.bind(null, callback, request, url, method)
    );
}

function saveRequest(callback, request, url, method, error, result) {
    if (error) {
        return request.emit('error', error);
    }
    // Get the client number.
    const client = result.insertId;
    // Persist client info to DB.
    database.insert(
        TREQUEST,
        {
            'client':    client,
            'url':       url,
            'method':    method,
            'server':    util.getLocalAddress(),
            'startTime': util.getTimeStamp()
        },
        handleInsert.bind(null, callback, request)
    );
}

function handleInsert(callback, request, error, result) {
    // Pass the new request ID to the callback.
    if (error) {
        return request.emit('error', error);
    }
    const requestID = result.insertId;
    callback(null, requestID);
}

/**
 * Finalise a request in the database.
 * @param requestID The request ID: @see startRequest
 * @param status The status when ending the request (0: success, 1: error).
 * @param callback A function(error, results) to call when done.
 */
function endRequest(requestID, status, callback) {
    log.trace(module, endRequest);
    database.update(
        TREQUEST,
        equal('id', requestID),
        { 'endTime': util.getTimeStamp(), 'status': status },
        callback
    );
}

/**
 * Get
 */
function getClientByID(id, callback) {
    database.find(
        TCLIENT,
        { lhs: 'id', op: '=', rhs: id },
        getClientByIDHelper.bind(null, callback),
        sortBy='num',
        descending=false
    );
}

function getClientByIDHelper(callback, error, rows) {
    if (error) {
        return callback(error);
    }
    callback(null, rows[0].num);
}

/**
 * Get the most recent location data associated with an ID, if available.
 * @param id The ID string, e.g. a phone number.
 * @param callback A function(error, results) to call when results are ready.
 */
function getLocation(id, callback) {
    log.trace(module, getLocation);
    getClientByID(id, (error, client) => {
        if (error) {
            return callback(error);
        }
        database.find(
            TLOCATION,
            { lhs: 'client', op: '=', rhs: client },
            getLocationHelper.bind(null, callback),
            sortBy='client',
            descending=true
        );
    });
}

function getLocationHelper(callback, error, rows) {
    if (error) {
        return callback(error);
    } else if (util.isNullOrUndefined(rows) || rows.length == 0 || rows[0] == null) {
        return callback(new Error('No location associated with ID'));
    }
    callback(error, rows[0]);
}

/**
 * List locations associated with an ID.
 * @param id The ID string.
 * @param callback A function(error, results) to call when results are ready.
 */
function listLocation(id, callback) {
    log.trace(module, listLocation);
    getClientByID(id, (error, client) => {
        if (error) {
            return callback(error);
        }
        database.find(TLOCATION, { lhs: 'client', op: '=', rhs: client}, callback);
    });
}

/**
 * Persist location data.
 * @param id The ID string.
 * @param time The POSIX timestamp.
 * @param longitude The longitude.
 * @param latitude The latitude.
 * @param callback A function(error, results) to call when results are ready.
 */
function setLocation(id, longitude, latitude, callback) {
    log.trace(module, setLocation);
    getClientByID(id, (error, client) => {
        if (error) {
            return callback(error);
        }
        database.insert(
            TLOCATION,
            {
                'client':    client,
                'longitude': longitude,
                'latitude':  latitude
            },
            callback
        );
    });
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
    // about 6.5 nm, which means the server won't return anything unless the user stands in a very
    // specific spot. To fix this, we allow a tolerance of 10^-6 degrees, which is about 11 m. We
    // then log how many results this returns (for debugging) and return the first (and hopefully
    // only) result.
    const R10M   = 10e-6;
    const lonMin = longitude - R10M;
    const lonMax = longitude + R10M;
    const latMin = latitude  - R10M;
    const latMax = latitude  + R10M;
    getPriceMap(lonMin, lonMax, latMin, latMax, (error, rows) => {
        var count  = 0;
        var result = null;
        if (rows && rows[0]) {
            count  = rows.length;
            result = rows[0];
        }
        log.debug(`${count} results within ${R10M} radius of (${latitude},${longitude})`);
        callback(error, result);
    });
}

/**
 * Get a list of rows where longitude and latitude are within [lonMin,lonMax] and [latMin,latMax]
 * respectively.
 */
function getPriceMap(lonMin, lonMax, latMin, latMax, callback) {
    log.trace(module, getPriceMap);
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
}
