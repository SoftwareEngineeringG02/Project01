/**
 * MySQL database interface.
 * @module database/lokijs
 */
const mysql = require('mysql');
const log   = require(`${SERVER_ROOT}/server/log`);
const util  = require(`${SERVER_ROOT}/util`);

var connection = null;

/**
 * Initialise the database.
 * @param config
 * @param callback
 */
function init(config, callback) {
    log.trace(module, init);
    // Create connection.
    connection = mysql.createConnection({
        host:     config.DB_HOST,
        port:     config.DB_PORT,
        database: config.DB_NAME,
        user:     config.DB_USER,
        password: config.DB_PASS
    });
    // Ensure DB is finalised before process ends.
    process.on('exit', () => {
        if (!(util.isNullOrUndefined(connection))) {
            connection.end((error) => {
                if (error) {
                    throw error;
                }
            });
        }
    });
    // Connect, handle error if any, otherwise call callback.
    connection.connect((error) => {
        if (error) {
            log.error('Database error: ' + error.toString());
            process.exit(1);
        }
        log.info('Connected to MySQL database');
        callback();
    });
}

module.exports.init = init;

/**
 * Find rows which match a column.
 * @param table The table to search.
 * @param search A Javascript object containing the keys: column (column name), operator (comparison
 * operator) and value (comparison value).
 * @param callback The function to call when results are ready.
 * @param [orderBy] An optional column to sort by.
 * @param [descending] Whether to sort in descending (true) or ascending (false, null, undefined)
 * order (default: ascending).
 */
function find(table, search, callback, orderBy, descending) {
    log.trace(module, find);
    if (util.isNullOrUndefined(connection)) {
        return log.error('Bug: Database used but not initialised');
    }
    // Escape DB inputs.
    const { column, operator, value } = search;
    const safeTable   = mysql.escapeId(table);
    const safeColumn  = mysql.escapeId(column);
    const safeValue   = mysql.escape(value);
    // Build query.
    var sql = `SELECT * FROM ${safeTable} WHERE ${safeColumn} ${operator} ${safeValue}`;
    if (!(util.isNullOrUndefined(orderBy))) {
        // Append sorting.
        const safeOrderBy = mysql.escapeId(orderBy);
        sql += ` ORDER BY ${safeOrderBy}`;
        if (descending) {
            sql += ' DESC';
        }
    }
    // Perform query.
    const query = connection.query(`SELECT * FROM ? WHERE ? ${operator} ?`,
                                   [table, column, value],
                                   callback);
    log.debug(query.sql);
}

module.exports.find = find;

/**
 * Insert a row into a table.
 */
function insert(table, row, callback) {
    if (util.isNullOrUndefined(connection)) {
        return log.error('Bug: Database used but not initialised');
    }
    const query = connection.query(`INSERT INTO ? VALUES(?)`, [table, row], callback);
    log.debug(query.sql);
}

module.exports.insert = insert;
