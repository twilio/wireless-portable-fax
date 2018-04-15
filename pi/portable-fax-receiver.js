'use strict';

const
    TwilioCommon = require('twilio-common'),
    SyncClient = require('twilio-sync'),
    StateMachine = require('javascript-state-machine'),
    request = require('request'),
    _ = require('lodash'),
    SerialPort = require('serialport'),
    // Serial port can be USB such as /dev/tty.usbserial-AO002TGL, 
    // Raspberry Pi, Seeed Wio port
    port = new SerialPort('/dev/tty.usbserial-AO002TGL', {
        baudRate: 19200
    }),
    Printer = require('./printer'),
    config = require('./config.js');

let accessManager = undefined;
let syncList = undefined;
// Used to make list of faxes to print
let queuedFaxes = [];
// This is the current fax being printed
let currentPrintJob = undefined;
let printer = new Printer({
    heatingTime: 120,
    heatingInterval: 3
});

// Configure state machine for printing
let fsm = new StateMachine({
    init: 'idle',
    transitions: [{
            name: 'print',
            from: 'idle',
            to: 'printing'
        },
        {
            name: 'reset',
            from: 'printing',
            to: 'idle'
        }
    ],
    methods: {
        onBeforePrint: function (event, from, to) {
            // What do you want to do before printing?
            // I want to get a fax to print.
            currentPrintJob = queuedFaxes.pop();
            // Cancel if there is no fax to print
            if (currentPrintJob === undefined) {
                console.log(`Canceling transition in OnBeforePrint`);
                return false;
            }
        },
        onPrint: function (event, from, to) {
            // What do you want to do on printing?
            // I want to set the fax status to 'printing'.
            console.log(`Printing ${currentPrintJob.data.FaxSid}.`);
            updateFax(currentPrintJob.index, 'printing')
                .then(response => {
                    // I want to print the fax.
                    printFax(currentPrintJob);
                }).catch(error => {
                    console.error(error);
                });
        },
        onBeforeReset: function(event, from, to) {
            // What do you want to after printing?
            // I want to update the fax status to 'printed'
            currentPrintJob.data.FaxStatus = 'printed';
            updateFax(currentPrintJob.index, 'printed')
                .then(response => {
                    currentPrintJob = undefined;
                }).catch(error => {
                    console.error(error);
                });
        },
        onReset: function (event, from, to) {
            // What do you want to do on Reset called?
            // Idle.
        }
    }
});

function printFax(fax) {
    let path = `${config.serverUrl}/faxes/${fax.data.FaxSid}/image`;
    printer
        .init(port)
        .then(() => {
            return printer.setBold(true);
        })
        .then(() => {
            return printer.writeLine(`From: ${fax.data.From}`);
        })
        .then(() => {
            return printer.lineFeed(1);
        })
        .then(() => {
            return printer.writeImage(path);
        })
        .then(() => {
            return printer.lineFeed(2);
        })
        .then(() => {
            return printer.print();
        })
        .then(printer => {
            console.log(`Finished printing ${fax.data.FaxSid}`);
            fsm.reset();
        })
        .catch(error => {
            console.error(error);
            console.log(`Print job failed.`);
            fsm.reset();
        });
}

function checkForPrintJob() {
    // Return if printer is printing
    if (fsm.state === 'printing') return;
    // Faxes in queue?
    if (queuedFaxes.length > 0) {
        fsm.print();
    } else {
        console.log('Patiently waiting for a fax to print.');
    }
}

// Constantly poll for new printer jobs every 10 seconds
setInterval(checkForPrintJob, 10000);

function bootstrapClient() {
    return new Promise(resolve => pollConfiguration(resolve));
}

// Get Sync token
function pollConfiguration(resolve) {
    request(config.tokenUrl, (err, res) => {
        if (!err) {
            let response = JSON.parse(res.body);
            console.log('Received configuration for portable-fax-machine.');
            resolve(response);
        } else {
            console.log('Failed fetching portable-fax-machine token.\n \
                Check Function endpoint.\n \
                Did you upload your Sync Token Function?\n', err);
            setTimeout(() => pollConfiguration(resolve), 2000);
        }
    });
}

// Update the status of the fax
function updateFax(index, status) {
    return syncList
        .update(index, {
            FaxStatus: status
        });
}

// Add fax to queue
function queueFax(fax) {
    console.log(`Queued ${fax.data.FaxSid}.`);
    queuedFaxes.push(fax);
}

// Subscribe to events on Sync list when new item added and item updated.
function subscribeSyncEvents() {
    syncList.on('itemAdded', args => {
        let fax = {
            index: args.item.index,
            data: args.item.value
        };
        // We only care about faxes 'queued' and 'printing'.
        if (fax.data.FaxStatus === 'received' ||
            fax.data.FaxStatus === 'printed'
        ) return;
        console.log(`Received new fax ${fax.data.FaxSid}.`);
        queueFax(fax);
    });
    syncList.on('itemUpdated', args => {
        let fax = {
            index: args.item.index,
            data: args.item.value
        };
        let found = _.find(queuedFaxes, {
            data: {
                FaxSid: fax.data.FaxSid
            }
        });
        
        if (found) { 
            let index = _.findIndex(queuedFaxes, function(x) { return x.data.FaxSid === fax.data.FaxSid; });
            queuedFaxes[index].data.FaxStatus = fax.data.FaxStatus;
            console.log(`Found ${fax.data.FaxSid}`);
            return;
        }

        if (fax.data.FaxStatus === 'queued' && !found) {
            queueFax(fax);
        }
    });
    syncList.on('itemRemoved', args => {
        let fax = {
            index: args.index,
            data: args.value
        };
        let found = _.find(queuedFaxes, {
            data: {
                FaxSid: fax.data.FaxSid
            }
        });
        if (found) {
            if (found.data.FaxSid === 'printing') return;
            console.log(`Removed ${fax.data.FaxSid}.`);
            // Object found remove from queuedFaxes
            // Remove object from queue as long as it's not printing.
            _.remove(queuedFaxes, e => {
                return e.data.FaxSid == found.data.FaxSid;
            });
        }
    });
}

bootstrapClient()
    .then(cfg => {
        config.sync = cfg;
        return new SyncClient(config.sync.token);
    })
    .then(client => {
        client.list(config.listName)
            .then(list => {
                syncList = list;
                // Subscribe to sync update events
                subscribeSyncEvents();
                return syncList.getItems();
            })
            .then(result => {
                result.items.forEach(fax => {
                    // First load.
                    // We only care about faxes 'queued' and 'printing' (see below).
                    if (fax.data.value.FaxStatus === 'received' ||
                        fax.data.value.FaxStatus === 'printed'
                    ) return;
                    // Is something in 'printing' state? 
                    // Probably stuck from a fatal crash, reset state to 'queued' to reprint.
                    if (fax.data.value.FaxStatus === 'printing') {
                        updateFax(fax.data.index, 'queued')
                            .then(response => {
                                // Do nothing here.
                            });
                    } else {
                        queueFax({
                            index: fax.data.index,
                            data: fax.data.value
                        });
                    }
                });
            });
        // Update token on expiration
        accessManager = new TwilioCommon.AccessManager(config.sync.token);
        accessManager.on('tokenExpired', () => {
            bootstrapClient()
                .then(cfg => {
                    config.sync.token = cfg.token;
                    accessManager.updateToken(cfg.token);
                });
        });
    })
    .catch(function (error) {
        console.error('Failed initializing: ', error);
    });