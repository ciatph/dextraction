/**
 * Compare the cell content of (2) CSV files per column.
 * Write the exact row from the CSV file being compared (TYPE_FILE_COMPARE) that matches to the TYPE_FILE_BASE csv file.
 * Optional: append column(s) from the base or compared CSV files to the output CSV.
 * @ciatph; 20181122
 */

 // Import the csv parser
var csvmerge = require('./scripts/csvcompare.js');

// Set the original base data set to search from
csvmerge.setFile('./data/data_csv.csv', csvmerge.TYPE_FILE_BASE);

// Set data set to look for in the TYPE_FILE_BASE
csvmerge.setFile('./data/Filtered_data_CWB.csv', csvmerge.TYPE_FILE_COMPARE);

// Set the CSV file output filename (where rows from TYPE_FILE_COMPARE 
// that matches with TYPE_FILE_BASE will be written)
csvmerge.setOutputFilename('results.csv');

// Set the CSV columns to check for in TYPE_FILE_BASE and TYPE_FILE_COMPARE.
// The CSV files can contain other column names but should have similar column names listed here, in any order
var prefix = ['15', '30', '45', '60'];
var weather = ['w_tmax', 'w_tmmin', 'w_tavg', 'w_drange', 'w_ftmax31', 'w_paccum', 'w_pdryday', 'w_vpavg', 'w_solar'];
var variables = ['_03yieldhect_clean'];

for(var i=0; i<prefix.length; i++){
    for(var j=0; j<weather.length; j++){
        variables.push(prefix[i] + weather[j]);
    }
}

csvmerge.setColumnsCheck([
    '_lon',
    '_lat'
]);

// Optional: set CSV columns from TYPE_FILE_BASE to include to the output file
csvmerge.setColumnsAppend({
    headers: variables,
    from: csvmerge.TYPE_FILE_BASE
});

// Read the CSV files. Write matching rows to a CSV file
csvmerge.readFile(csvmerge.file1, function(){
    console.log('Data has been loaded! Base data FILE1 has ' + csvmerge.file1.csvdata.length + ' rows.');

    csvmerge.readFile(csvmerge.file2, function(){
        console.log(' --- Data has been loaded! Data to compare FILE2 has ' + csvmerge.file2.csvdata.length + ' rows.');

        // Compare file1 (final processed) and file2 (raw data)
        var index = csvmerge.compare();
        csvmerge.writeToFile(csvmerge.filtered);
        console.log('Similar records: ' + index.length);
    });    
});