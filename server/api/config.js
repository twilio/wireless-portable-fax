module.exports = (() => {
    'use strict';
    return {
        // Twilio credentials
        // https://www.twilio.com/console
        accountSid: '{{YOUR_ACCOUNT_SID}}',
        authToken: '{{YOUR_AUTH_TOKEN}}',
        // Twilio Wireless
        // https://www.twilio.com/console/wireless/sims
        // (Optional for Raspberry Pi branch. See "Seeed Wio branch"
        simSid: '{{SIM_SID}}',
        // Twilio Functions
        // https://www.twilio.com/console/runtime/functions/manage
        // See the runtime directory for more information
        syncTokenUrl: 'https://{{YOUR-RUNTIME-DOMAIN}}.twil.io/portable-fax-token',
        faxInsertUrl: 'https://{{YOUR-RUNTIME-DOMAIN}}.io/portable-fax-sync',
        // Twilio Sync
        // https://www.twilio.com/console/sync/services
        // See the runtime directory for more information
        // Sync Service Sids begin with IS
        syncServiceSid: '{{YOUR-SERVICE-SID}}',
        syncListName: 'PORTABLE_FAX_MACHINE'
    };
})();