/**
 * Server API model.
 * @module api/model
 */
'use strict';

const log  = require('../server/log');
const loki = require('lokijs');
const util = require('../util');

/**
 * Initialise the model.
 * @param config The configuration. Either a string which names the path to the database, or a
 * Javascript object containing a property called 'database' which names the path to the database.
 */
function init(config) {
    log.trace(module, init);
    // Find the database path.
    var path = null;
    if (typeof config === 'string') {
        path = config;
    } else if (typeof config === 'object') {
        path = config.DATABASE;
    } else {
        return log.error(`Invalid type '${typeof config}' of parameter 'config'`);
    }
    // Open the database with autoloading and autosaving (see initDB).
    log.info(`Opening database '${path}'`);
    database = new loki(path, {
        autoload:         true,
        autoloadCallback: initDB,
        autosave:         true,
        autosaveInterval: 1000
    });
    if (util.isNullOrUndefined(database)) {
        // Log error and quit on failure.
        log.error('Fatal: Failed to open database');
        process.exit(1);
    }
    // Save DB on exit.
    process.on('exit', function() {
        if (!(util.isNullOrUndefined(database))) {
            database.saveDatabase();
        }
    })
    // Initialise the database.
    function initDB() {
        log.info('Initialising database');
        // Try to load location data.
        locdata = database.getCollection('locdata');
        if (util.isNullOrUndefined(locdata)) {
            // Create a collection for the location data.
            locdata = database.addCollection('locdata');
            if (util.isNullOrUndefined(locdata)) {
                // Log error and quit on failure.
                log.error('Fatal: Database error');
                process.exit(1);
            }
        }
    }
}

module.exports.init = init;

/**
 * Get the most recent location data associated with an ID, if available.
 * @param id The ID string, e.g. a phone number.
 * @return A Javascript object containing the longitude and latitude on success; otherwise,
 * undefined.
 */
function getLocation(id) {
    log.trace(module, getLocation);
    if (util.isNullOrUndefined(database) || util.isNullOrUndefined(locdata)) {
        return log.error('Bug: Database used but not initialised');
    }
    // Get a list of entries in 'locdata' with correct ID, sorted by decreasing timestamp.
    const entries = locdata.chain().find({ id: { '$eq': id }}).simplesort('time', false).data();
    if (entries.length >= 1) {
        // Return long/lat for the most recent (first) entry.
        const { longitude, latitude } = entries[0];
        return { longitude, latitude };
    }
    // Return null if there are no results.
    return null;
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
    log.trace(module, module.exports.setLocation);
    if (util.isNullOrUndefined(database) || util.isNullOrUndefined(locdata)) {
        return log.error('Bug: Database used but not initialised');
    }
    return locdata.insert({ id: id, time: time, longitude: longitude, latitude: latitude });
}

module.exports.setLocation = setLocation;

var database = undefined;
var locdata  = undefined;
