/**
 * Server API model.
 * @module api/model
 */
const database = require(`${global.SERVER_ROOT}/database/lokijs`);
const log      = require(`${global.SERVER_ROOT}/server/log`);
const util     = require(`${global.SERVER_ROOT}/util`);

/**
 * Initialise the model.
 * @param config The configuration. Either a string which names the path to the database, or a
 * Javascript object containing a property called 'database' which names the path to the database.
 */
function init(config) {
    log.trace(module, init);
    // Find the database path.
    var filepath = null;
    if (typeof config === 'string') {
        filepath = config;
    } else if (typeof config === 'object') {
        filepath = config.DATABASE;
    } else {
        throw new TypeError(`Invalid type '${typeof config}' of parameter 'config'`);
    }
    return database.init(filepath);
}

module.exports.init = init;

/**
 * Get the most recent location data associated with an ID, if available.
 * @param id The ID string, e.g. a phone number.
 * @return A Javascript object containing the longitude, latitude and time on success; otherwise,
 * undefined.
 */
function getLocation(id) {
    log.trace(module, getLocation);
    const entries = database.find({ id: { '$eq': id }}, 'time', false);
    if (util.isNullOrUndefined(entries) || entries.length == 0) {
        return null;
    }
    const  { longitude, latitude, time } = entries[0];
    return { longitude, latitude, time };
}

module.exports.getLocation = getLocation;

/**
 * Persist location data.
 * @param id The ID string.
 * @param time The POSIX timestamp.
 * @param longitude The longitude.
 * @param latitude The latitude.
 */
function setLocation(id, time, longitude, latitude) {
    log.trace(module, setLocation);
    return database.insert({
        'id': id,
        'time': time,
        'longitude': longitude,
        'latitude': latitude
    });
}

module.exports.setLocation = setLocation;
