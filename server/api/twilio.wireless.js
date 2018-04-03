module.exports = (() => {
    'use strict';
    const
        config = require('./config.js'),
        client = require('twilio')(config.accountSid, config.authToken);

    function sendCommand(command) {
        return new Promise((resolve, reject) => {
            if (command == undefined || command == '') {
                reject({
                    message: 'Command body is empty.'
                });
            }

            client.wireless.commands.create({
                    command: command.sid,
                    sim: config.simSid
                })
                .then(() => {
                    resolve({
                        message: 'Command sent.'
                    });
                })
                .catch((error) => {
                    reject(error);
                })
        });
    }

    return {
        sendCommand
    };
})();