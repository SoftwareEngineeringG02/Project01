/**
 * Server API model.
 * @module api/model
 */
const database = require(`${global.SERVER_ROOT}/database/mysql.js`);
const log      = require(`${global.SERVER_ROOT}/server/log`);
const util     = require(`${global.SERVER_ROOT}/util`);

/**
 * Initialise the model.
 * @param config The configuration.
 */
function init(config, callback) {
    log.trace(module, init);
    return database.init(config, callback);
}

module.exports.init = init;

// Table containing price data.
const TPRICE    = 'price';
// Table containing location data.
const TLOCATION = 'location';

/**
 * Get the most recent location data associated with an ID, if available.
 * @param id The ID string, e.g. a phone number.
 * @return A Javascript object containing the longitude, latitude and time on success; otherwise,
 * undefined.
 */
function getLocation(id, callback) {
    log.trace(module, getLocation);
    database.find(TLOCATION, { column: 'id', operator: '=', value: id }, preCallback, 'time');
    function preCallback(error, rows) {
        if (util.isNullOrUndefined(rows) || rows.length == 0) {
            callback(error, null);
        } else {
            callback(error, rows[0]);
        }
    }
}

module.exports.getLocation = getLocation;

function listLocation(id, callback) {
    log.trace(module, listLocation);
    database.find(TLOCATION, { column: 'id', operator: '=', value: id}, callback);
}

module.exports.listLocation = listLocation;

/**
 * Persist location data.
 * @param id The ID string.
 * @param time The POSIX timestamp.
 * @param longitude The longitude.
 * @param latitude The latitude.
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

module.exports.setLocation = setLocation;
