const bunyan = require('bunyan');

const logger = bunyan.createLogger({
    name: 'transport-schedule',
    stream: process.stdout,
    level: 'debug'
});
module.exports = logger;