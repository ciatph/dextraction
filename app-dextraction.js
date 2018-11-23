/**
 * 1. Read the final cassava famrland data from firebase DB.
 * 2. Merge the ISU-updated GPS points associated with farmer names (/data/gps/json) to the loaded data.
 * 3. Extract IRRI weather variables for each row record.
 * 4. Clean the final merged data set.
 * 5. Write output to files: /data/data_csv.csv
 *                           /data/data_json.json
 * @ciatph;20181123
 */

// External HTTP requests
const request = require('request');

// Allow cross-origin
const cors = require('cors')({ origin: true });

// File I/O
const fs = require('fs');

// Main script
var dextraction = require('./scripts/dextraction.js');

// Set list of valid years to process
dextraction.setBacktrackDays(['2014', '2015', '2016']);

// Set the list of number of days to fetch IRRI weather data
dextraction.setBacktrackDays([30, 60]);


// Load, process and export the processed data sets.
// Merge the ISU-updated GPS points on the online firebase data set (gps.json)
// Export the merged data as CSV and JSON
dextraction.loadData({
    // firebase farmer information REST url
    farmer_info: 'https://us-central1-appdatacollect-3b7d7.cloudfunctions.net/getdata?node=farmer_info',

    // firebase farmland information REST url
    farmland_setup: 'https://us-central1-appdatacollect-3b7d7.cloudfunctions.net/getdata?node=farmland_setup',

    // ISU-updated GPS points matched with farmer names from firebase data set
    gps: 'data/gps.json'
});