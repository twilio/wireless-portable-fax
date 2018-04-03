module.exports = (() => {
    'use strict';
    const
        config = require('./config.js'),
        client = require('twilio')(config.accountSid, config.authToken);

    function get(sid) {
        return client.fax.v1.faxes(sid).fetch();
    }

    function getAll() {
        return client.fax.v1.faxes.list();
    }

    function remove(sid) {
        return client.fax.v1.faxes(sid).remove();
    }

    return {
        get,
        getAll,
        remove
    }
})();