'use strict';

const logger = require('./logger');

function rejectWithDelay(reason, attempt, timeout) {
    return new Promise(function (resolve, reject) {
        logger.debug(`Failing attempt #${attempt}`);
        if (timeout !== 0) {
            logger.debug(`Retrying in ${timeout} ms`);
        }
        setTimeout(() => reject(reason), timeout);
    });
}

function retryMaxDelay(max, delay, fn) {
    let p = Promise.reject();
    for (let i = max; i > 0; i--) {
        let d = delay;
        p = p.catch(fn).catch(reason => rejectWithDelay(reason, max - i, (i === 1) ? 0 : d));
        delay *= 2;
    }
    return p;
}

module.exports = {
    retryMaxDelay
};