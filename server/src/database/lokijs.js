/**
 * LokiJS database interface.
 * @module database/lokijs
 */
const loki = require('lokijs');
const log  = require(`${SERVER_ROOT}/server/log`);
const util = require(`${SERVER_ROOT}/util`);

/**
 * Initialise the database.
 * @param filepath The path to where the database is or will be stored.
 */
function init(filepath) {
    log.trace(module, init);
    // Open the database with autoloading and autosaving (see initDB).
    log.info(`Opening database '${filepath}'`);
    database = new loki(filepath, {
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
 * Find entries which match a pattern.
 * @param search A Javascript object containing the name of the column to search and the value to
 * search for. Example: { column: { '$eq': value } }
 * @param [sortBy] An optional column to sort by.
 * @param [ascending] Whether to sort in ascending (true) or descending (false, null, undefined)
 * order.
 */
function find(search, sortBy, ascending) {
    log.trace(module, find);
    if (util.isNullOrUndefined(database) || util.isNullOrUndefined(locdata)) {
        return log.error('Bug: Database used but not initialised');
    }
    // Get a list of entries in 'locdata' which match 'search'.
    const entriesChain = locdata.chain().find(search);
    var entries = entriesChain.data();
    if (!(util.isNullOrUndefined(sortBy))) {
        if (util.isNullOrUndefined(ascending)) {
            ascending = false;
        }
        entries = entriesChain.simplesort(sortBy, ascending).data();
    }
    return entries;
}

module.exports.find = find;

function insert(entry) {
    if (util.isNullOrUndefined(database) || util.isNullOrUndefined(locdata)) {
        return log.error('Bug: Database used but not initialised');
    }
    return locdata.insert(entry);
}

module.exports.insert = insert;

var database = null;
var locdata  = null;
