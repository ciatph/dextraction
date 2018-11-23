/**
 * Compares (2) identical column csv files and write their similar 
 * columns and rows into an output csv file
 * ciatph; 20181102
 */

const _fs = require('fs');
const _fastcsv = require('fast-csv');
const _eventemitter = require('events');
const _json2csv = require('json2csv').Parser;


var CsvMerge = function(){
    this.TYPE_FILE_BASE = 1;
    this.TYPE_FILE_COMPARE = 2;

    // base file to reference
    this.file1 = {
        path: '',
        csvdata: []
    };

    // file to compare to base file
    this.file2 = {
        path: '',
        csvdata: []
    };

    // Set of filtered and matched data from file1 and file2
    this.filtered = [];

    // Set of CSV table columns to compare
    this.columns_check = [];

    // Array of JS Objects containing key-value pairs of optional table columns to append to the output csv
    this.columns_append = {
        headers: [],
        from: -1
    };

    // filename where output results will be written
    this.filename_out = '';

    this.init();
};


/**
 * Initialize this object
 */
CsvMerge.prototype.init = function(){
    this.columns_append = {
        // String array of optional column headers to append ot the output csv file
        headers: [],    
        // Where the headers[] columns came from: TYPE_FILE_BASE | TYPE_FILE_COMPARE
        from: this.TYPE_FILE_BASE
    };
};



/**
 * Sets the column names to check for equal content in the CSV files
 * @param {Array[] of String column names to check for equality } columns 
 */
CsvMerge.prototype.setColumnsCheck = function(columns){
    this.columns_check = columns;
};



CsvMerge.prototype.setColumnsAppend = function(appendObj){
    this.columns_append = appendObj;    
};


/**
 * Set the filename of CSV file where output data will be written
 * @param {String: CSV output filename} filename 
 */
CsvMerge.prototype.setOutputFilename = function(filename){
    this.filename_out = filename;
};


/**
 * Set the base or reference file
 * @param {CSV file path with file name} filepath 
 * @param {CSV reference type: TYPE_FILE_BASE | TYPE_FILE_COMPARE} type 
 */
CsvMerge.prototype.setFile = function(filepath, type){
    if(type === this.TYPE_FILE_BASE){
        this.file1 = {
            path: '',
            csvdata: []
        };

        this.file1.path = filepath;
    }
    else if(this.TYPE_FILE_COMPARE){
        this.file2 = {
            path: '',
            csvdata: []
        };

        this.file2.path = filepath;
    }
};



/**
 * Read the CSV file
 * @param {CSV file path to read} file 
 */
CsvMerge.prototype.readFile = function(fileObject, callback){
    let readableStreamInput = _fs.createReadStream(fileObject.path);

    _fastcsv
        .fromStream(readableStreamInput, {headers: true})
        .on('data', function(data){
            let rowData = {};

            Object.keys(data).forEach(key => {
                rowData[key] = data[key];
            });

            fileObject.csvdata.push(rowData);
        })
        .on('end', () => {
            console.log('csvData', fileObject.csvdata);
            console.log('total rows: ' + fileObject.csvdata.length);

            if(callback !== undefined)
                callback();
        });
};



/**
 * Write JS string to text file
 * @param {String data} data 
 */
CsvMerge.prototype.writeToFile = function(data, filename){
    var that = this;

    if(data.length == 0){
        console.log("Nothing to write.");
        return;
    }

    // Set the column headers
    var headers = [];
    for(var i=0; i<this.columns_check.length; i++)
        headers.push(this.columns_check[i]);

    // Append the optional column headers
    this.columns_append.headers.forEach(function(value, index){
        headers.push(value);
    });

    const opts = { headers };
    const parser = new _json2csv(opts);
    const csv = parser.parse(data);

    
    _fs.writeFile((filename !== undefined) ? filename : this.filename_out, csv, function(err){
        if(err)
            console.log('Error writing to file ' + err);
        else
            console.log('Matching results written to ' + that.filename_out); 
    });
};



/**
 * Compare each column of @file2's row with @file1 for an exact row-match.
 * Store all matching rows to this.filtered[]. 
 * Return an array[] containing the indices of all matched rows
 * @param {Array of JSON data (converted from CSV). Reference file} file1 
 * @param {Array of JSON data (converted from CSV). File to compare} file2
 * @param {JS Object containing details of optional columns to append to output CSV} appendObj
 * @param {Format: {headers:[], type:TYPE_FILE_BASE | TYPE_FILE_COMPARE} }
 */
CsvMerge.prototype.compare = function(file1, file2, appendObj){
    let base = (file1 !== undefined) ? file1 : this.file1.csvdata;
    let compare = (file2 !== undefined) ? file2 : this.file2.csvdata;
    let similars = [];

    for(var i=0; i<compare.length; i++){
        console.log('Processing item # ' + i);

        // Compare the columns from base file
        for(var j=0; j<base.length; j++){
            var count = 0;

            // Compare current record with each base record
            for(var key in base[j]){
                if(this.columns_check.indexOf(key) !== -1){
                    var _root = base[j];
                    var _item = compare[i];

                    if(compare[i][key] !== undefined){
                        // Column content
                        var item = compare[i][key].toLowerCase().replace(/ /g, '');
                        var root = base[j][key].toLowerCase().replace(/ /g, '');

                        if(item === root){
                            console.log(' ' + item  + ' == ' + root);
                            count++;
                        }
                        else{
                            console.log(' ' + item  + ' != ' + root);
                            break;
                        }
                    }                        
                }
            }

            // Save record if all keys (columns) are similar
            if(count === this.columns_check.length){
                similars.push(j);
                this.filtered.push(compare[i]);
                console.log(' ---> Row ' + i + ' match found! At row ' + j + ', similar-columns: ' + count + '/' + this.columns_check.length + ', matches: [' + similars.length + ']');

                // Append the optional columns
                if(this.columns_append.headers.length > 0){
                    for(var k=0; k<this.columns_append.headers.length; k++){
                        var optional_key = this.columns_append.headers[k];

                        if(_root[optional_key] !== undefined){
                            this.filtered[this.filtered.length-1][optional_key] = _root[optional_key];
                        }
                    }

                }
                break;
            }
            else{
                console.log('NOT FOUND, now comparing row [' + i + '] to next row ' + (j+1) + ', similar-columns: ' + count + '/' + this.columns_check.length + ', matches: [' + similars.length + ']');
            }
        }
    }

    return similars;
};


module.exports = new CsvMerge();


