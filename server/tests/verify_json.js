/**
 * Verifies that a JSON object contains a single property and that the property has a particular
 * type and value.
 * @module verify_json
 */
if (process.argv.length < 6) {
    console.error(`Usage: ${process.argv[1]} <JSON data> <property name> <expected type> <expected value>`);
}

const json          = process.argv[2];
const propertyName  = process.argv[3];
const expectedType  = process.argv[4];
const expectedValue = process.argv[5];
const object        = JSON.parse(json);

if (typeof process.env.QUIET == 'undefined' || process.env.QUIET == 0) {
    console.log(object);
    console.log(`Type of ${propertyName} is ${typeof object[propertyName]}`);
    console.log(`Value of ${propertyName} is ${object[propertyName]}`);
}

// Test the type of the property. If it doesn't exist, typeof returns 'undefined' so we can match
// directly (and strictly) against expectedType, which can be undefined if the user wants to make
// sure a certain property /doesn't/ exist).
if (typeof object[propertyName] !== expectedType) {
    process.exit(1);
}

// Test against the value of the property. We're using the unequal operator !=) instead of the
// strict unequal operator (!==) because the former will convert the property to a string, the same
// as expectedValue, before comparison. This is nice because we don't have to do any explicit
// parsing.
if (object[propertyName] != expectedValue) {
    process.exit(1);
}

// Return 0 if both tests passed.
return 0;
