/**
 * MySQL database interface.
 * @module database/mysql
 */
const mysql = require('mysql');
const log   = require(`${SERVER_ROOT}/server/log`);
const util  = require(`${SERVER_ROOT}/util`);

module.exports.init   = init;
module.exports.find   = find;
module.exports.insert = insert;

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
                    return callback(error);
                }
            });
        }
    });
    // Connect, handle error if any, otherwise call callback.
    connection.connect((error) => {
        if (error) {
            return callback(error);
        }
        log.info('Connected to MySQL database');
        callback(null);
    });
}

/**
 * Find rows which match a column.
 * @param table The table to search.
 * @param search A Javascript object containing the keys: lhs (column name), op (comparison
 * operator) and rhs (comparison value). If operator is "and" or "or", "lhs" and "rhs" are
 * nested objects.
 * @param callback The function to call when results are ready.
 * @param [orderBy] An optional column to sort by.
 * @param [descending] Whether to sort in descending (true) or ascending (false, null, undefined)
 * order (default: ascending).
 */
function find(table, search, callback, orderBy, descending) {
    log.trace(module, find);
    if (util.isNullOrUndefined(connection)) {
        throw new Error('Bug: Database used but not initialised');
    }
    var sql = makeSelect(table, search);
    // Escape DB inputs.
    if (!(util.isNullOrUndefined(orderBy))) {
        // Append sorting.
        const safeOrderBy = mysql.escapeId(orderBy);
        sql += ` ORDER BY ${safeOrderBy}`;
        if (descending) {
            sql += ' DESC';
        }
    }
    // Perform query.
    const query = connection.query(sql, callback);
    log.debug(query.sql);
}

function makeSelect(table, search, inner) {
    const safeTable = mysql.escapeId(table);
    const { lhs, op, rhs } = search;
    var where = '';
    if (op == 'and' || op == 'or') {
        // Join nested expressions.
        const lhsExpr = makeSelect(table, lhs, true);
        const rhsExpr = makeSelect(table, rhs, true);
        where = `${lhsExpr} ${op} ${rhsExpr}`;
    } else {
        // Generate simple expression.
        const safeLHS = mysql.escapeId(lhs);
        const safeRHS = mysql.escape(rhs);
        where = `${safeLHS} ${op} ${safeRHS}`;
    }
    // Return the query with 'SELECT...FROM' prefix unless this is a nested expression.
    if (inner) {
        return where;
    } else {
        return `SELECT * FROM ${safeTable} WHERE ${where}`
    }
}

/**
 * Insert a row into a table.
 */
function insert(table, row, callback) {
    if (util.isNullOrUndefined(connection)) {
        throw new Error('Bug: Database used but not initialised');
    }
    const safeTable = mysql.escapeId(table);
    const query = connection.query(`INSERT INTO ${safeTable} SET ?`, [row], callback);
    log.debug(query.sql);
}
