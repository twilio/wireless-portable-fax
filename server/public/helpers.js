'use strict';
// Nice to have convenience methods
Array.prototype.destroy = function (obj) {
    // Return null if no objects were found and removed
    var destroyed = null;
    for (var i = 0; i < this.length; i++) {
      // Use while-loop to find adjacent equal objects
      while (this[i] === obj) {
        // Remove this[i] and store it within destroyed
        destroyed = this.splice(i, 1)[0];
      }
    }
    return destroyed;
  }