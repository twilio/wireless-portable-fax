module.exports = (() => {
    'use strict';
    return {
        // Twilio Functions
        // https://www.twilio.com/console/runtime/functions/manage
        tokenUrl: 'https://{{YOUR-TWILIO-DOMAIN-HERE}}.twil.io/portable-fax-token',
        // Twilio Sync List name
        // https://www.twilio.com/console/sync/services
        listName: 'PORTABLE_FAX_MACHINE',
        // Holds sync config properties
        sync: {},
        // Base URL of express server
        serverUrl: 'http://localhost:5000'
    };
})();