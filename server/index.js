'use strict';

const http = require('http');

const PORT = 80;

module.exports.startServer = function(port) {
    const requestHandler = function(request, response) {
        console.log('Request: <address=' + request.connection.remoteAddress + ', url=' + request.url + '>');
        response.end('Success!');
    }
    const server = http.createServer(requestHandler);
    server.listen(port, function(err) {
        if (err) {
            return console.log('Error: ' + err);
        }
        console.log('Listening on localhost:' + port);
    });
    return server;
}

module.exports.startServer(PORT);
