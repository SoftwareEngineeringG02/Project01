'use strict';

const http = require('http');

module.exports.startServer = function(config) {
    const requestHandler = function(request, response) {
        console.log('Request <address=' + request.connection.remoteAddress + ', url=' + request.url + '>');
        response.end('Success!');
    }
    const server = http.createServer(requestHandler);
    server.listen(config['port'], function(err) {
        if (err) {
            return console.log('Error: ' + err);
        }
        console.log('Listening on ' + config['address'] + ':' + config['port']);
    });
    return server;
}
