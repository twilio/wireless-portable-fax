'use strict';

var faxes = new Vue({
  el: '#faxesTable',
  data: {
    ascending: false,
    sortColumn: '',
    rows: [],
    syncClient: undefined,
    accessManager: undefined,
    syncListName: 'PORTABLE_FAX_MACHINE',
    syncList: undefined
  },
  mounted: function () {
    this.bootstrapSyncClient();
  },
  methods: {
    'updateFaxTable': function updateFaxTable(items) {
      items.forEach(fax => {
        if (!this.rows.some(e => e.sid === fax.data.FaxSid)) {
          this.rows.push({
            index: fax.data.index,
            sid: fax.data.value.FaxSid,
            from: fax.data.value.From,
            pages: fax.data.value.NumPages,
            status: fax.data.value.FaxStatus,
            document: fax.data.value.MediaUrl,
            action: undefined
          })
        }
      });
    },
    'deleteRow': function deleteRow(row) {
      console.log(row);
      // Remove fax from local datasource
      this.$data.rows.find(e => {
        if (row === undefined || e === undefined) return;
        if (e.sid === row.FaxSid) {
          this.$data.rows.destroy(e);
        }
      });
    },
    'printFax': function printFax(row) {
      // Don't re-queue
      if (row.status === 'queued' ||
        row.status === 'printing') {
        console.log('Can`t do that.');
        return;
      }
      console.log(`Queue ${row.sid} with ${row.index} for printing.`);
      // Update list item to be 'queued' for printing.
      this.syncList.update(row.index, {
          FaxStatus: 'queued'
        })
        .then(item => {
          // List item has been updated
          console.log('List Item update successful, new value:', item.value);
        })
        .catch(error => {
          console.error('List Item update failed', error);
        });
    },
    'deleteFax': function deleteFax(row) {
      if (row.status === 'printing') {
        alert("You can't delete a fax that is printing.");
        return;
      }
      if (confirm("Delete Fax? This is permanent!")) {
        // Remove fax from Twilio Programmable Fax resource
        // Remove from sync resource
        let sid = row.sid;
        this.$http.delete(`/faxes/${sid}`, {
            body: {
              sid: sid,
            }
          })
          .then(response => {
            console.log(`Deleted Fax with Sid ${sid}`);
          });
      }
    },
    // Sync methods
    'bootstrapSyncClient': function bootstrapSyncClient() {
      this.$http.get('/token')
        .then(response => {
          this.accessManager = new Twilio.AccessManager(response.body.token);
          this.accessManager.on('tokenUpdated', am => {
            this.syncClient = new Twilio.Sync.Client(response.body.token);
            this.syncClient.list(this.$data.syncListName)
              .then(list => {
                this.syncList = list;
                return this.syncList.getItems();
              })
              .then(result => {
                this.updateFaxTable(result.items);
                this.subscribeSyncEvents();
              });
          });
          // Update token on expiration
          this.accessManager.on('tokenExpired', () => {
            // Request new token from your backend and set it to the accessManager
            this.$http.get('/token')
              .then(response => {
                accessManager.updateToken(response.body.token);
              });
          });
        });
    },
    'subscribeSyncEvents': function subscribeSyncEvents() {
      this.syncList.on('itemAdded', args => {
        console.log(`Adding item with index ${args.item.index} to list.`);
        console.log(args.item);
        this.updateFaxTable([args.item]);
      });
      this.syncList.on('itemRemoved', args => {
        // Remove item because removed _remotely_ from printer.
        console.log(`Removing item with index ${args.index} to list.`);
        this.deleteRow(args.value);
      });
      this.syncList.on('itemUpdated', args => {
        console.log(`Updating item with index ${args.item.index} to list.`);
        this.$data.rows.find((item, index) => {
          if (item.sid === args.item.value.FaxSid) {
            // The status is the only thing that will change unless removed from datasource.
            this.$data.rows[index].status = args.item.value.FaxStatus;
          }
        });
      });
    },
    'sortTable': function sortTable(col) {
      if (this.sortColumn === col) {
        this.ascending = !this.ascending;
      } else {
        this.ascending = true;
        this.sortColumn = col;
      }
      let ascending = this.ascending;
      this.rows.sort(function (a, b) {
        if (a[col] > b[col]) {
          return ascending ? 1 : -1
        } else if (a[col] < b[col]) {
          return ascending ? -1 : 1
        }
        return 0;
      })
    }
  },
  computed: {
    'columns': function columns() {
      if (this.rows.length == 0) {
        return [];
      }
      return Object.keys(this.rows[0])
    }
  }
});