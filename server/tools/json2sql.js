/**
 * Create SQL commands from JSON data.
 * @module tools/json2sql
 */

var fs    = require('fs');
var mysql = require('mysql');

if (process.argv.length < 3) {
    console.error(`Usage: ${process.argv[0]} ${process.argv[1]} <JSON file>`);
    process.exit(1);
}

fs.readFile(process.argv[2], (error, data) => {
    if (error) {
        console.error(error.toString());
        process.exit(1);
    }
    const json = JSON.parse(data);
    for (var i = 0; i < json.length; ++i) {
        console.log(`INSERT INTO price SET ${mysql.escape(json[i])};`);
    }
});
