
'use strict';

const restify = require('restify');
const logger = require('./logger');

const server = restify.createServer({});

server.pre(restify.pre.sanitizePath());
server.use(restify.bodyParser({
    mapParams: false
}));
server.use(restify.queryParser());
server.use((req, res, next) => {
    logger.debug(`${req.method} ${req.url}`);
    logger.debug('Request params: ', req.params);
    next(req, res);
});

server.on('uncaughtException', function (req, res, route, error) {
    res.json(500, {route, error});
});

module.exports = server;