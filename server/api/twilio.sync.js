module.exports = (() => {
    'use strict';
    const
        request = require('request'),
        config = require('./config.js'),
        client = require('twilio')(config.accountSid, config.authToken),
        syncService = client.sync.services(config.syncServiceSid);


    function getAll() {
        return syncService
            .syncLists(config.syncListName)
            .syncListItems.list();
    }

    function find(faxSid) {
        return new Promise((resolve, reject) => {
            let result = undefined;
            syncService
                .syncLists(config.syncListName)
                .syncListItems
                .list()
                .then(response => {
                    response.forEach(item => {
                        if (item.data.FaxSid === faxSid) {
                            result = {
                                index: item.index
                            };
                            return;
                        }
                    });
                    resolve(result);
                }).catch(error => {
                    reject(error);
                });
        });
    }

    function removeItem(index) {
        return new Promise((resolve, reject) => {
            syncService
                .syncLists(config.syncListName)
                .syncListItems(index)
                .remove()
                .then(response => {
                    resolve(response);
                }).catch(error => {
                    reject(error);
                });
        });
    }

    return {
        getAll,
        find,
        removeItem
    }
})();