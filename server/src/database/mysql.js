/**
 * MySQL database interface.
 * @module database/mysql
 */
const mysql = require('mysql');
const log   = require(`${SERVER_ROOT}/server/log`);
const util  = require(`${SERVER_ROOT}/util`);

module.exports.init         = init;
module.exports.find         = find;
module.exports.insert       = insert;
module.exports.insertIgnore = insertIgnore;
module.exports.update       = update;

var connection = null;

/**
 * Initialise the database.
 * @param config The configuration.
 * @param callback A function(error) to call when complete.
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
 * @param [orderBy] An optional column to sort by.
 * @param [descending] Whether to sort in descending (true) or ascending (false, null, undefined)
 * order (default: ascending).
 * @param [column] Whether to select just one or a few columns, or all of them (*). Default: *
 */
function find(table, search, orderBy, descending, column='*') {
    log.trace(module, find);
    return new Promise((resolve, reject) => {
        // Escape DB inputs.
        const safeColumn = column == '*' ? column : mysql.escapeId(column);
        const safeTable  = mysql.escapeId(table);
        var   sql        = makeSelect(safeTable, search);
        if (!(util.isNullOrUndefined(orderBy))) {
            // Append sorting.
            const safeOrderBy = mysql.escapeId(orderBy);
            sql += ` ORDER BY ${safeOrderBy}`;
            if (descending === true) {
                sql += ' DESC';
            } else {
                sql += ' ASC';
            }
        }
        // Perform query.
        const query = connection.query(sql, dbCallback.bind(null, resolve, reject));
        log.debug(query.sql);
    });
}

/**
 * Insert a row into a table.
 * @param table The table to insert into.
 * @param row The row to insert.
 */
function insert(table, row) {
    return new Promise((resolve, reject) => {
        const safeTable = mysql.escapeId(table);
        const query     = connection.query(
            `INSERT INTO ${safeTable} SET ?`,
            [row],
            dbCallback.bind(null, resolve, reject)
        );
        log.debug(query.sql);
    });
}

/**
 * Insert a row into a table. Ignore error if the row already exists.
 * @param table The table to insert into.
 * @param row The row to insert.
 */
function insertIgnore(table, row) {
    return new Promise((resolve, reject) => {
        const safeTable = mysql.escapeId(table);
        const query = connection.query(
            `INSERT IGNORE INTO ${safeTable} SET ?`,
            [row],
            dbCallback.bind(null, resolve, reject)
        );
        log.debug(query.sql);
    });
}

/**
 * Update a row.
 * @param table The table to update into.
 * @param search The search key to find the row. @see find
 * @param columns The columns to update.
 */
function update(table, search, columns) {
    return new Promise((resolve, reject) => {
        if (util.isNullOrUndefined(connection)) {
            throw new ReferenceError('Bug: Database used but not initialised');
        }
        const safeTable = mysql.escapeId(table);
        const where = makeSelect(safeTable, search, true);
        const query = connection.query(
            `UPDATE ${safeTable} SET ? where ${where}`,
            [columns],
            dbCallback.bind(null, resolve, reject)
        );
        log.debug(query.sql);
    });
}

// Pass error/result along to real callback. Used to prevent database error messages finding their
// way into responses and giving attackers detailed info about the server's state.
function dbCallback(resolve, reject, error, result) {
    if (error) {
        return reject(error);
    } else {
        return resolve(result);
    }
}

// Generate a SQL select statement. NB: makeSelect expects 'safeTable' to be escaped!
function makeSelect(safeTable, search, inner=false, safeColumn='*') {
    const { lhs, op, rhs } = search;
    var where = '';
    if (op == 'and' || op == 'or') {
        // Join nested expressions.
        const lhsExpr = makeSelect(safeTable, lhs, true);
        const rhsExpr = makeSelect(safeTable, rhs, true);
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
        return `SELECT ${safeColumn} FROM ${safeTable} WHERE ${where}`;
    }
}
