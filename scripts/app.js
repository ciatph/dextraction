// Data class
var dextraction = require('./dextraction.js');

// External HTTP requests
const request = require('request');

// Allow cross-origin
const cors = require('cors')({ origin: true });

// File I/O
const fs = require('fs');


/**
 * Load data sets
 */
exports.start = function(){
    dextraction.loadData();
};

