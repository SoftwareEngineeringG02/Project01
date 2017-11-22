/**
 * Server API model.
 * @module api/model
 */
const database = require(`${SERVER_ROOT}/database/mysql.js`);
const log      = require(`${SERVER_ROOT}/server/log`);
const util     = require(`${SERVER_ROOT}/util`);

module.exports.startRequest = startRequest;
module.exports.endRequest   = endRequest;
module.exports.getLocation  = getLocation;
module.exports.listLocation = listLocation;
module.exports.setLocation  = setLocation;
module.exports.getPrice     = getPrice;
module.exports.getPriceMap  = getPriceMap;

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
    // then log how many results this returns (for debugging) and return the first (and hopefully only) result.
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
