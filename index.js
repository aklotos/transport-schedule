'use strict';

const server = require('./lib/server');
const config = require('./config.json');

const scheduleApi = require('./lib/schedule-api');

server.get('/stop/:stopId/schedule/nearest', scheduleApi.getNearest);

server.listen(config.port);