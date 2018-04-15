module.exports = (() => {
    'use strict';
    const
        fax = require('./twilio.fax.js'),
        sync = require('./twilio.sync.js');

    function removeFromSync(faxSid) {
        return new Promise((resolve, reject) => {
            sync.find(faxSid)
                .then(response => {
                    sync.removeItem(response.index)
                        .then(response => {
                            resolve({
                                status: 204
                            })
                        })
                        .catch(error => {
                            reject(error);
                        });
                })
        });
    }

    function removeFromFax(faxSid) {
        return new Promise((resolve, reject) => {
            fax.remove(faxSid)
                .then(response => {
                    resolve({
                        status: 204
                    })
                })
                .catch(error => {
                    reject(error);
                });
        });
    }

    function remove(faxSid) {
        return new Promise((resolve, reject) => {
            Promise.all([removeFromSync(faxSid), removeFromFax(faxSid)])
                .then(response => {
                    resolve(response);
                })
                .catch(error => {
                    reject(error);
                });
        });
    }
    return {
        remove
    }
})();