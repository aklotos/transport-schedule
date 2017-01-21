'use strict';

const server = require('./lib/server');

const scheduleApi = require('./lib/schedule-api');

server.get('/stop/:stopId/schedule/nearest', scheduleApi.getNearest);

server.get('/ping', (req, res, next) => {
    res.send("I'm working!");
});

server.listen(process.env.PORT || 8080);