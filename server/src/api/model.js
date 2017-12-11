/**
 * Server API model.
 * @module api/model
 */
var https = require('https');

var database = require(`${SERVER_ROOT}/database/mysql.js`);
var log      = require(`${SERVER_ROOT}/server/log`);
var util     = require(`${SERVER_ROOT}/util`);

module.exports.startRequest    = startRequest;
module.exports.endRequest      = endRequest;
module.exports.getLocation     = getLocation;
module.exports.listLocation    = listLocation;
module.exports.setLocation     = setLocation;
module.exports.getPrice        = getPrice;
module.exports.getPriceMap     = getPriceMap;
module.exports.getPostcode     = getPostcode;
module.exports.reversePostcode = reversePostcode;
module.exports.getPostcodeMap  = getPostcodeMap;

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
    return all.then(results => results[2].insertId);
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
    );
}

/**
 * Get the most recent location data associated with an ID, if available.
 * @param client  The client ID.
 */
function getLocation(client) {
    log.trace(module, getLocation);
    return database.find(TLOCATION, equal('client', client), 'client', true)
        .then(rows => rows[0])
    ;
}

/**
 * List locations associated with an ID.
 * @param client The client ID.
 */
function listLocation(client) {
    log.trace(module, listLocation);
    return database.find(TLOCATION, equal('client', client));
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
    );
}

/**
 * Retrieve price for longitude and latitude.
 * @param longitude The longitude.
 * @param latitude The latitude.
 */
function getPrice(longitude, latitude) {
    log.trace(module, getPrice);
    // Longitudes and latitudes in the DB are precise to 13 decimal places. 10^-12 of a degree is
    // about 6.5 nm, which means the server won't return anything unless the user stands in a very
    // specific spot. To fix this, we allow a tolerance of 10^-6 degrees, which is about 10 m.
    const R10M   = 10e-6;
    const lonMin = longitude - R10M;
    const lonMax = longitude + R10M;
    const latMin = latitude  - R10M;
    const latMax = latitude  + R10M;
    const search = and(and(gteq('longitude', lonMin), lteq('longitude', lonMax)),
                       and(gteq('latitude',  latMin), lteq('latitude',  latMax)));
    return database.find(TPRICE, search)
        .then(map => {
            // Find the entry closest to longitude and latitude.
            if (map && map.length) {
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
            } else {
                return Promise.reject(-1);
            }
        })
    ;
}

/**
 * Get a list of rows where longitude and latitude are within [lonMin,lonMax] and [latMin,latMax]
 * respectively.
 */
function getPriceMap(longitude, latitude, radius) {
    log.trace(module, getPriceMap);
    // Compute boundaries.
    // FIXME: longitude and latidude are reversed.
    const DIST2DEG = 111000;             // Distance to degrees longitude/latitude conversion factor
    const degrees = radius/DIST2DEG;     // Distance converted to degrees longitude/latitude.
    const lonMin  = longitude - degrees;
    const lonMax  = longitude + degrees;
    const latMin  = latitude  - degrees;
    const latMax  = latitude  + degrees;
    const search  = and(and(gteq('longitude', lonMin), lteq('longitude', lonMax)),
                        and(gteq('latitude',  latMin), lteq('latitude',  latMax)));
    var map;
    var min;
    return database.find(TPRICE, search)
        .then(map_ => {
            map = map_;
            return getMinPrice();
        })
        .then(min_ => {
            min = min_;
            return getMaxPrice();
        })
        .then(max => {
            map.push(min);
            map.push(max);
            return map;
        })
    ;
}


/**
 * Get a postcode from a longitude/latitude.
 * @param longitude
 * @param latitude
 */
function getPostcode(longitude, latitude) {
    log.trace(module, getPostcode);
    // First try to pull the postcode from the local database.
    return database.find(
        TPRICE,
        and(equal('longitude', longitude), equal('latitude', latitude))
    ).then(result => {
        if (util.isNullOrUndefined(result) || result.length === 0) {
            return getPostcodeOnline(longitude, latitude);
        }
        return Promise.resolve(result.postcode);
    });
}

function getPostcodeOnline(longitude, latitude) {
    const HOSTNAME = 'https://api.postcodes.io';
    const ENDPOINT = '/postcodes';
    return new Promise((resolve, reject) => {
        // FIXME: longitude and latitude are reversed in DB.
        https.get(
            `${HOSTNAME}/${ENDPOINT}?lon=${latitude}&lat=${longitude}&limit=1`,
            handleOnlinePostcode.bind(null, resolve, reject)
        );
    });
}

function handleOnlinePostcode(resolve, reject, response) {
    var data = '';
    response.on('data', chunk => { data += chunk; });
    response.on('end', () => {
        const object = JSON.parse(data);
        if (object && object.result && object.result[0] && object.result[0].postcode) {
            return resolve(object.result[0].postcode);
        }
        return reject(new util.ServerError('Could not find postcode'));
    });
}

/**
 * Get a longitude and latitude from a postcode.
 * @param postcode The postcode.
 */
function reversePostcode(postcode) {
    log.trace(module, reversePostcode);
    // First try to find the longitude and latitude in the local database.
    return database.find(
        TPRICE,
        equal('postcode', postcode)
    ).then(result => {
        if (util.isNullOrUndefined(result) || result.length == 0) {
            return reversePostcodeOnline(postcode);
        }
        // FIXME: client expects reversed longitude and latitude.
        const { longitude, latitude } = result[0];
        return Promise.resolve({ latitude: longitude, longitude: latitude });
    });
}

function reversePostcodeOnline(postcode, callback) {
    const HOSTNAME = 'https://api.postcodes.io';
    const ENDPOINT = '/postcodes';
    return new Promise((resolve, reject) => {
        var request = https.get(
            `${HOSTNAME}/${ENDPOINT}?query=${postcode}`,
            handleOnlineReversePostcode.bind(null, resolve, reject, postcode)
        );
    });
}

function handleOnlineReversePostcode(resolve, reject, postcode, response) {
    var data = '';
    response.on('data', chunk => { data += chunk; });
    response.on('end',  () => {
        const object = JSON.parse(data);
        if (object && object.result && object.result[0] && object.result[0].longitude && object.result[0].latitude) {
            // FIXME lon/lat are reversed in database.
            const { longitude, latitude } = object.result[0];
            return resolve({longitude: latitude, latitude: longitude});
        }
        return reject(new util.ServerError('Could not find postcode'));
    });
}

/**
 * Get a price map from a post code.
 */
function getPostcodeMap(postcode) {
    log.trace(module, getPriceMap);
    var map;
    var min;
    return database.find(TPRICE, equal('postcode', postcode))
        .then(map_ => {
            map = map_;
            return getMinPrice();
        })
        .then(min_ => {
            min = min_;
            return getMaxPrice();
        })
        .then(max => {
            map.push(min);
            map.push(max);
            return map;
        })
    ;
}

/**
 * Get the lowest price in the DB.
 */
function getMinPrice() {
    // Hack to generate the appropriate SQL.
    return database.find(TPRICE, null, null, null, ['MIN(price)', 'longitude', 'latitude'])
        .then(rows => {
            const result = rows[0];
            return {
                price:     result['MIN(price)'],
                longitude: result['longitude'],
                latitude:  result['latitude']
            };
        })
    ;
}

/**
 * Get the highest price in the DB.
 */
function getMaxPrice() {
    // Hack to generate the appropriate SQL.
    return database.find(TPRICE, null, null, null,  ['MAX(price)', 'longitude', 'latitude'])
        .then(rows => {
            const result = rows[0];
            return {
                price:     result['MAX(price)'],
                longitude: result['longitude'],
                latitude:  result['latitude']
            };
        })
    ;
}

function equal(lhs, rhs) { return { lhs, op: '=',   rhs }; }
function gteq(lhs,  rhs) { return { lhs, op: '>=',  rhs }; }
function lteq(lhs,  rhs) { return { lhs, op: '<=',  rhs }; }
function and(lhs,   rhs) { return { lhs, op: 'and', rhs }; }
