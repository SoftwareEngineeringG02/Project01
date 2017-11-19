/**
 * Server API model.
 * @module api/model
 */
const database = require(`${global.SERVER_ROOT}/database/mysql.js`);
const log      = require(`${global.SERVER_ROOT}/server/log`);
const util     = require(`${global.SERVER_ROOT}/util`);


module.exports.init         = init;
module.exports.getLocation  = getLocation;
module.exports.listLocation = listLocation;
module.exports.setLocation  = setLocation;
module.exports.getPrice     = getPrice;

/**
 * Initialise the model.
 * @param config The configuration.
 */
function init(config, callback) {
    log.trace(module, init);
    return database.init(config, callback);
}


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
    const columns = { lhs: { lhs: 'longitude', op: '=', rhs: longitude },
                      op:  'and',
                      rhs: { lhs: 'latitude',  op: '=', rhs: latitude } };
    database.find(TPRICE, columns, preCallback);
    function preCallback(error, results) {
        if (util.isNullOrUndefined(results) || results.length == 0) {
            callback(error, null);
        } else {
            callback(error, results[0])
        }
    }
}
