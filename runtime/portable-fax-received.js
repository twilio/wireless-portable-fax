const LIST_NAME = 'PORTABLE_FAX_MACHINE';

exports.handler = function (context, event, callback) {
  let client = context.getTwilioClient();
  let syncService = client.sync.services(context.PORTABLE_FAX_MACHINE_SYNC_SERVICE_SID);

  syncService
    .syncLists
    .list()
    .then(response => {
      // In this Sync service there will only ever be one list
      if (response.length === 0) {
        console.log('Creating list');
        syncService.syncLists
          .create({
            uniqueName: LIST_NAME,
            ttl: 0 // live forever
          })
          .then(response => {
            console.log('Created list');
            /// The lists exists _now_
            insertItem(syncService, event)
              .then(response => {
                console.log('New list created and item created.');
                callback(null, {
                  status: 204
                });
              });
          })
          .catch(error => {
            console.log(error);
            callback(null, {
              status: 500
            });
          });
      } else {
        // The list already exists
        insertItem(syncService, event)
          .then(response => {
            callback(null, {
              status: 204
            });
          })
          .catch(error => {
            callback(null, {
              status: 500
            });
          });
      }
    });
}

function insertItem(service, item) {
  console.log('Inserting item\n');
  return new Promise((resolve, reject) => {
    service
      .syncLists(LIST_NAME)
      .syncListItems.create({
        data: item
      })
      .then(response => resolve(response))
      .catch(error => reject(error));
  });
}