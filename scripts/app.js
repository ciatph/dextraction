// Data class
var dextraction = require('./dextraction.js');

// External HTTP requests
const request = require('request');

// Allow cross-origin
const cors = require('cors')({ origin: true });

// File I/O
const fs = require('fs');


/**
 * Load data sets */
exports.start = function(){
    // Load, process and export the processed data sets.
    // Merge the ISU-updated GPS points on the online firebase data set (gps.json)
    // Export the merged data as CSV and JSON
    dextraction.loadData({
        farmer_info: 'https://us-central1-appdatacollect-3b7d7.cloudfunctions.net/getdata?node=farmer_info',
        farmland_setup: 'https://us-central1-appdatacollect-3b7d7.cloudfunctions.net/getdata?node=farmland_setup',
        gps: 'data/gps.json'
    });
};