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
        { lhs: 'id', op: '=', rhs: requestID },
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
        return callback('No location associated with ID');
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
    // then log how many results this returns (for debugging) and return the first (and hopefully only) result.
    const R10M   = 10e-6;
    const lonMin = longitude - R10M;
    const lonMax = longitude + R10M;
    const latMin = latitude  - R10M;
    const latMax = latitude  + R10M;
    getPriceMap(lonMin, lonMax, latMin, latMax, (error, rows) => {
        var count  = 0;
        var result = null;
        if (rows) {
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
    const search = { lhs: { lhs: { lhs: 'longitude', op: '>=', rhs: lonMin },
                            op:  'and',
                            rhs: { lhs: 'longitude', op: '<=', rhs: lonMax } },
                     op:  'and',
                     rhs: { lhs: { lhs: 'latitude', op: '>=', rhs: latMin },
                            op:  'and',
                            rhs: { lhs: 'latitude', op: '<=', rhs: latMax } } };
    database.find(TPRICE, search, callback);
}
