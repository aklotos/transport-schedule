'use strict';

const request = require('superagent');
const config = require('../config.json');
const retry = require('./promise-retry').retryMaxDelay;
const logger = require('./logger');

/**
 * GET /stop/:stopId/schedule/nearest
 */
function getNearest(req, res, next) {

    const stopId = parseInt(req.params.stopId);
    const maxRetry = parseInt(req.params.retry || 1);

    const getNearestPromise = () => request.get(config.api.url.home)
        .set(config.api.headers)
        .then(page => {
            logger.debug('Downloaded page with stop and verification tokens');

            const data = page.text;

            const verificationToken = extractToken(data);
            const stopToken = extractStopToken(extractFuncValue(data), stopId);

            return {stopToken, verificationToken};
        })
        .then(payload =>
            request.post(config.api.url.schedule)
                .set(config.api.headers)
                .send({
                    p: 'minsk',
                    s: stopId,
                    v: payload.stopToken,
                    __RequestVerificationToken: payload.verificationToken
                })
                .type('application/x-www-form-urlencoded')
                .accept('json')
        ).then(data => {
            logger.debug('Received raw data with schedule information, parsing to json');
            return JSON.parse(data.text)
        });

    retry(maxRetry, 500, getNearestPromise)
        .then(data => {
            logger.debug('Returning data to the client');
            res.json(data);
        }).catch(error => {
        logger.warn('Error while trying to fetch minsktrans schedule: ', error);
        res.json(500, {error: error.message});
    })
}

function extractToken(data) {
    const re = /input name=\"__RequestVerificationToken\".*\svalue=\"(.*?)\"/;
    const foundToken = re.exec(data);
    logger.debug('Extracting verification token: ', foundToken[1]);
    return foundToken[1];
}

function extractFuncValue(data) {
    var re = /function \(a\) \{ return (\d+) (.) a;/;
    var foundFunction = re.exec(data);
    logger.debug('Extracting stop token: ', foundFunction !== null);
    // logger.debug('data: ', data);
    if (!foundFunction) {
        logger.warn(`Stop token not found`);
        if (data.match(/id="Email"/g) && data.match(/id="Password"/g)) {
            throw new Error('Cookie invalidation');
        }
    }
    logger.debug('value: ', foundFunction[1], 'operation: ', foundFunction[2]);
    return {value: parseInt(foundFunction[1]), operation: foundFunction[2]};
}

function extractStopToken(funcValue, stopId) {
    switch (funcValue.operation) {
        case '+':
            return funcValue.value + stopId;
        case '^':
            return funcValue.value ^ stopId;
    }
}

module.exports = {
    getNearest
};