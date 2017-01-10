
'use strict';

var restify = require('restify');

var server = restify.createServer({});

server.pre(restify.pre.sanitizePath());
server.use(restify.bodyParser({
    mapParams: false
}));
server.use(restify.queryParser());

server.on('uncaughtException', function (req, res, route, error) {
    res.json(500, {route, error});
});

module.exports = server;