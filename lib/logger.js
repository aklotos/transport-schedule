const bunyan = require('bunyan');

module.exports = bunyan.createLogger({
    name: 'transport-schedule',
    stream: process.stdout,
    level: 'debug'
});