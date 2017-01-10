const config = require('../config.json');
const request = require('superagent');

/**
 * GET /stop/:stopId/schedule/nearest
 */
function getNearest(req, res, next) {
    const stopId = parseInt(req.params.stopId);

    request.get(config.api.url.home)
        .set(config.api.headers)
        .then(page => {
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
        res.send(JSON.parse(data.text));
    })
}

function extractToken(data) {
    const re = /input name=\"__RequestVerificationToken\".*\svalue=\"(.*?)\"/;
    const foundToken = re.exec(data);
    console.log('token: ', foundToken[1]);
    return foundToken[1];
}

function extractFuncValue(data) {
    var re = /function \(a\) \{ return (\d+) (.) a;/;
    var foundFunction = re.exec(data);
    console.log('value: ', foundFunction[1], 'operation: ', foundFunction[2]);
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
}