#!/usr/bin/env bash
if [ -e node_modules/newrelic/newrelic.js ]
then
  node > newrelic.js <<EOF
//Read default node config
var settings = require('./node_modules/newrelic/newrelic.js');

//Manipulate data
settings.config.app_name = '$1';
settings.config.license_key = '$2';

//Output data
console.log(JSON.stringify(settings));

EOF
fi
