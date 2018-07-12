// Data class
var dextraction = require('./dextraction.js');

// External HTTP requests
const request = require('request');

// Allow cross-origin
const cors = require('cors')({ origin: true });

// File I/O
const fs = require('fs');


var loadFarmerInfoData = function(){
    // Online firebase url of all farmland data
    var url = 'https://us-central1-appdatacollect-3b7d7.cloudfunctions.net/getdata?node=farmland_setup';
   request(url, function(error, response, body){
        if(!error && response.statusCode === 200){
            dextraction.data = JSON.parse(body);
            console.log('loaded data!!! ' + dextraction.getObjectLength(dextraction.data) + '\nall: ' + dextraction.countdata() + '\ngps-only: ' + dextraction.countdata(true));
            
            // Get the farmer record keys
            for(var start in dextraction.data){
                for(var year in dextraction.data[start]){
                    for(var user in dextraction.data[start][year]){
                        for(var farmer in dextraction.data[start][year][user]){
                            for(var plot in dextraction.data[start][year][user][farmer]){
                                for(var key in dextraction.data[start][year][user][farmer][plot]){
                                    if(dextraction.record_keys.indexOf(key) === -1 && key !== '0'){
                                        console.log(key);
                                        dextraction.record_keys.push(key);
                                    }
                                    else{
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        else{
            console.log('error loading data!!!');
        }
    });
};

/**
 * Load data sets
 */
exports.start = function(){
    // dextraction.init();    // Create a new dextraction class 
    dextraction.loadData();
};

