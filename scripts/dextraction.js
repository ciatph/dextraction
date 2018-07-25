// External HTTP requests
const request = require('request');
var fs = require('fs');
var readline = require('readline');
var out = new (require('stream'))();
var json2csv = require('json2csv').Parser;
var utils = require('./utils');


var Dextraction = function(){
    // farmland plots data with farmer information
    this.data;

    // farmer information only
    this.data_farmerinfo;

    // new gps updates from isu
    this.data_gps;

    // final data to be analyzed with weather data
    this.data_processed = [];

    this.ref_weather = {};

    // array of firebase keys for a farmer record
    this.record_keys = [];

    // Default average _11growthstg (months after P&D was observed)
    this.AVG_GROWTH_STG_MAP_VALUE = 7;
};


/**
 * Get all unique farmer names from the subplot level from online-loaded data
 * Gets only the first and last name
 * Returns an Object of format:
 * - count: no. of unique names
 * - data: a string array of JSON objects, format: [{firstname:"", lastname:""},...]
 * - array: a JS array of JSON objects
 */
Dextraction.prototype.getAllFarmers = function(){
    var uniqueids = [];
    var array = [];
    var str = '[';
    var count = 0;

    for(var start in this.data){
        for(var year in this.data[start]){
            if(['2014','2015'].indexOf(year) >= 0){
                for(var user in this.data[start][year]){
                    for(var farmer in this.data[start][year][user]){
                        for(var plot in this.data[start][year][user][farmer]){
                            if(uniqueids.indexOf(farmer) === -1){
                                var fname = utils.cleanField(this.data[start][year][user][farmer][plot]['_01fname'].toLowerCase().trim());
                                var lname = utils.cleanField(this.data[start][year][user][farmer][plot]['_03lname'].toLowerCase().trim());
    
                                uniqueids.push(farmer);
                                str += '{firstname:"' + fname + '", lastname:"' + lname + '"},'; 
                                array.push(fname + lname);
                                count++;
                            }
                        }
                    }
                }
            }
        }    
    }

    str = str.substring(0, str.length-1);
    str += ']';

    return {
        count: count,
        //data: str,
        array: array
    };
};


Dextraction.prototype.loadFarmland = function(url){
    var self = this;

    if(url === undefined || url === ''){
        console.log('Invalid url');
        return;
    }

    // Online firebase url of all farmland data
   request(url, function(error, response, body){
        if(!error && response.statusCode === 200){
            self.data = JSON.parse(body);
            console.log('loaded data!!! ' + utils.getObjectLength(self.data) + '\nall: ' + self.countdata() + '\ngps-only: ' + self.countdata(true));
            
            // Get the farmer record keys
            for(var start in self.data){
                for(var year in self.data[start]){
                    for(var user in self.data[start][year]){
                        for(var farmer in self.data[start][year][user]){
                            for(var plot in self.data[start][year][user][farmer]){
                                for(var key in self.data[start][year][user][farmer][plot]){
                                    if(self.record_keys.indexOf(key) === -1 && key !== '0'){
                                        self.record_keys.push(key);
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

            // count data
            self.mergedata();
        }
        else{
            console.log('error loading farmland data!!!');
        }
    });
};


/**
 * Load data sets
 * - online firebase data
 * - local ISU-modified gps points
 * @param urlObj JS Object containing REST urls for data
 * Format:
 * - farmer_info: Firebase REST url for farmer names
 * - famrland_setup: Firebase REST url for farmland information
 * - gps: Url for updated GPS points matched to farmer names
 */
Dextraction.prototype.loadData = function(urlObj){
    var self = this;

    // Check urls
    if(urlObj === undefined || Object.keys(urlObj).length !== 3){
        console.log('File urls are invalid or missing');
        return;
    }

    // Check for empty urls
    for(key in urlObj){
        if(urlObj[key] === ''){
            console.log('Missing url for ' + key);
            return;
        }
    }
    
    // Online firebase url of all farmer information
    request(urlObj.farmer_info, function(error, response, body){
        if(!error && response.statusCode == 200){
            self.data_farmerinfo = JSON.parse(body).data;
            console.log('loaded farmer information!');

            // Load the farmland data
            self.loadFarmland(urlObj.farmland_setup);
        }
        else{
            console.log('error loading farmer information');
        }
    });


    // Load ISU-updated data
    var localUrl = urlObj.gps;
    fs.readFile(localUrl, 'utf8', function(err, data){
        if(err){
            console.log('error reading file ' + err);
        }
        else{
            self.data_gps = JSON.parse(data);
            console.log('file read! ' + utils.getObjectLength(self.data_gps) + ' new gps records');
        }
    });
};


/**
 * Counts the number of subplots data
 * @param includeGps    indicates if only records with GPS '_06loc' will be counted
 */
Dextraction.prototype.countdata = function(includeGps){
    var c = 0;
    var gpsOnly = (includeGps !== undefined) ? includeGps : false;
  
    for(var start in this.data){
        for(var year in this.data[start]){
            for(var user in this.data[start][year]){
                for(var farmer in this.data[start][year][user]){
                    for(var plot in this.data[start][year][user][farmer]){
                        var gps = this.data[start][year][user][farmer][plot]['_06loc'];
                        // Increment counter only if record has GPS
                        if(gpsOnly){
                            if(gps !== ''){
                                c++;
                            }
                        }
                        else{
                            // Increment counter for all records
                            c++;
                        }
                    }
                }
            }
        }
    }
  
    return c;
};


/**
 * Get the entire farmer record using farmer's first and last names from cached online data
 * @param {*} name 
 */
Dextraction.prototype.getFarmerRecord = function(farmerId){
    var farmerlist = {};

    for(var year in this.data['data']){
        for(var user in this.data['data'][year]){
            for(var farmer in this.data['data'][year][user]){
                // The farmerID is found among the list
                if(farmer === farmerId){
                    for(var plot in this.data['data'][year][user][farmer]){
                        console.log('year: ' + year + '\nuser: ' + user + '\nfarmer: ' + farmer + '\nplot: ' + plot);
                        farmerlist[plot] = this.data['data'][year][user][farmer][plot];
                    }
                    break;
                }
            }
        }
    }

    return farmerlist;
};


/**
 * Get the entire farmer record using 
 * - farmer's first and last names from cached online data
 * - plot number '_plotno'
 * @param {*} name 
 */
Dextraction.prototype.getFarmerRecordPlot = function(farmerId, plotNo){
    var farmerlist = {};

    for(var year in this.data['data']){
        for(var user in this.data['data'][year]){
            for(var farmer in this.data['data'][year][user]){
                // The farmerID is found among the list
                if(farmer === farmerId){
                    for(var plot in this.data['data'][year][user][farmer]){
                        var pid = this.data['data'][year][user][farmer][plot]['_plotno'];
                        if(plotNo === parseInt(pid)){
                            farmerlist[plot] = this.data['data'][year][user][farmer][plot];
                        }
                    }
                    break;
                }
            }
        }
    }

    return farmerlist;
};


/**
 * Get the ISU-provided farmer record with the updated GPS
 */
Dextraction.prototype.getUpdatedGPS = function(name){
    for(var i=0; i<this.data_gps.length; i++){
        var dataName = utils.normalizeNames(this.data_gps[i].name);
        if(dataName.name === name){
            return this.data_gps[i];
        }
    }
    return null;
};


/**
 * Check if the name exists in the online record
 * Returns the farmerID if name exists
 * @param {*} name 
 */
Dextraction.prototype.nameExists = function(searchname){
    for(var year in this.data_farmerinfo){
        for(var user in this.data_farmerinfo[year]){
            for(var farmer in this.data_farmerinfo[year][user]){
                var name = this.data_farmerinfo[year][user][farmer]['_01fname'] + ' ' + this.data_farmerinfo[year][user][farmer]['_03lname'];
                var normallized = utils.normalizeNames(name).name;
                
                if(normallized === searchname){
                    return farmer; 
                }
            }
        }
    }
    return null;
};


/**
 * Gets the cell ID for a given gps coordinate
 * @param {A JS object containing GPS coordinates. Format: {Lat:"",Lon:""}} coords 
 */
Dextraction.prototype.getCellId = function(coords){
    var row = 1 + Math.floor((90 - parseFloat(coords.Lat)) / 0.25);
    var col = 1 + Math.floor((parseFloat(coords.Lon) + 180) / 0.25);
    var cell = (row - 1) * 1440 + col;

    return {
        row: row,
        col: col,
        cell: cell
    };
};


/**
 * Merge the new ISU-edited GPS data to existing data matched by farmer names
 * Process and clean data cells
 */
Dextraction.prototype.mergedata = function(){
    var count_match = 0;
    var count_missed = 0;
    var farmerlist = this.getAllFarmers();
    var missed = [];

    var newdata = [];
    var wh = [];
    var unique_cellid = [];
    var newcsv = '[';
    var count_gps_all = 0;

    var self = this;
    var dmg = {
        "0% - 20%": "1",
        "20% - 40%": "2",
        "40% - 60%": "3",
        "60% - 80%": "4",
        "80% - 100%": "5"                                
    };
    
    // Count how many new names matched in the existing data
    for(var i=0; i<this.data_gps.length; i++){
        // Add a new field, matches
        this.data_gps[i]['match'] = 'false';

        var new_name = utils.normalizeNames(this.data_gps[i].name);

        // New farmer name (with updated gps from ISU's updated records) matches a name record from the existing data
        if(farmerlist.array.indexOf(new_name.name) >= 0){
            // New farmer names matched with farmer names in list
            //this.data_gps[i]['match'] = 'true';
            count_match++;

            // Get the farmer ID of the existing new farmer name
            var farmerId = this.nameExists(new_name.name);
            
            if(farmerId !== null){
                // Farmer plot(s)
                var record = this.getFarmerRecordPlot(farmerId, new_name.plot);

                if(utils.getObjectLength(record) > 0){
                    // Replace the gps coordinates with new values
                    //var gpsupdate = this.getUpdatedGPS(new_name.name);
                    for(var id in record){
                        count_gps_all++;
                        
                        // 1. Split the Lon and Lat and update with ISU's new GPS points
                        record[id]['_06loc'] = '';
                        record[id]['_lon'] = this.data_gps[i].Lon;
                        record[id]['_lat'] = this.data_gps[i].Lat;
                        delete record[id]['_06loc'];

                        // 2. Get the month after where P&D was observed
                        record[id]['_11growthstg_clean'] = this.AVG_GROWTH_STG_MAP_VALUE; // default value: 7
                        record[id]['w_growthstg_date'] = '';

                        // Get and process the _11growthstg if not empty
                        if(record[id]['_11growthstg'] !== ''){                         
                            // Check for a range of values separated by ","
                            if(record[id]['_11growthstg'].indexOf(',') >= 0){
                                console.log('--DETECTED RANGE, ' + record[id]['_11growthstg']);
                            }
                    
                            record[id]['_11growthstg_clean'] = (record[id]['_11growthstg'].indexOf(',') >= 0) ? 
                                record[id]['_11growthstg'].split(',')[0] : record[id]['_11growthstg'];           
                                
                            // 3. Clean strings if contains "harvest"
                            if(record[id]['_11growthstg_clean'].indexOf("harvest") >= 0)
                                record[id]['_11growthstg_clean'] = utils.getmonth(record[id]['_08hvdate']);
                        }

                        // 4. Find the P&D  growth stage date (date after P&D was observed)
                        if(record[id]['_07pdate'] !== ''){
                            record[id]['w_growthstg_date'] = utils.addmonths(record[id]['_07pdate'], record[id]['_11growthstg_clean'], 'string');
                            record[id]['_yr_obs'] = utils.getmonth(record[id]['w_growthstg_date'], '-', 'year').toString(); 
                        }                       

                        // 5. Find the weather cell ID
                        var wh = this.getCellId({Lon:this.data_gps[i].Lon, Lat:this.data_gps[i].Lat});
                        record[id]['row'] = wh.row;
                        record[id]['col'] = wh.col;

                        if(record[id]['_yr_obs'] !== undefined){
                            if(record[id]['_yr_obs'].length === 4){
                                // TO-DO do not remove missing weather files, do not accept invalid-years (length < 4)
                                if(record[id]['_yr_obs'] !== '2018'){
                                    var cell = 'nsch' + wh.cell + '.' + record[id]['_yr_obs'].substring(1, record[id]['_yr_obs'].length);  
                                    record[id]['cell_id'] = cell;
                                }
                            }
                        }

                        // Initialize empty objects for ref_weather
                        if(unique_cellid.indexOf(cell) === -1 && record[id]['_yr_obs'] !== undefined){
                            unique_cellid.push(cell);
                            console.log('cell: ' + cell);

                            // Load all the unique weather files once
                            this.ref_weather[cell] = {};           
                        }        
                        
                        // 6. Match MAP - number of months after planting when crop was harvested
                        record[id]['_map'] = utils.getmonthdiff(record[id]['_07pdate'], record[id]['_08hvdate']);

                        // 7. Convert _15deg pest damage to integer
                        record[id]['_15deg_num'] = (record[id]['_15deg'] !== '') ? dmg[record[id]['_15deg']] : 0;

                        // 8. Remove misplaced dates on _04rootspl
                        if(record[id]['_04rootspl'] !== ''){
                            // replace all letters
                            var chars = record[id]['_04rootspl'].match(/[A-z]/g);
                            if(chars !== null){
                                record[id]['_04rootspl'] = '';
                            }

                            // replace dashes
                            if(record[id]['_04rootspl'].indexOf('-') >= 0){
                                record[id]['_04rootspl'] = record[id]['_04rootspl'].replace('-', ' to ');
                            }
                        }
                        
                        // 9. Separate comma-delimited merged area
                        if(record[id]['_06area'] !== ''){
                            var sep = [',',';','-'];
                            sep.forEach(function(delim){
                                if(record[id]['_06area'].indexOf(delim) >= 0){
                                    var areas = record[id]['_06area'].split(delim);
                                    record[id]['_06area'] = areas[parseInt(record[id]['_plotno'])-1];//.replace(/[^0-9\.]/g, '');
                                }
                            });
                        }

                        // 10. Clean BASAL_TYPE: If BASAL_TYPE contains 'Others', copy top BASAL_QTY value to it
                        // And delete BASAL_QTY. Ignore any values in BASAL_QTY
                        if(record[id]['BASAL_TYPE'] === 'Others' || record[id]['BASAL_TYPE'] === '')
                            record[id]['BASAL_TYPE'] = record[id]['BASAL_QTY'];

                            if(record[id]['SIDE_TYPE'] === 'Others' || record[id]['SIDE_TYPE'] === '')
                            record[id]['SIDE_TYPE'] = record[id]['SIDE_QTY'];
                            
                            if(record[id]['TOP_TYPE'] === 'Others' || record[id]['TOP_TYPE'] === '')
                            record[id]['TOP_TYPE'] = record[id]['TOP_QTY'];         


                        // 11. Separate the combined _09pdist_prow and convert to centimeters
                        if(record[id]['_09pdist_prow'] !== ''){
                            // Hard-coded!
                            if(record[id]['_09pdist_prow'].indexOf('40 25') >= 0)
                                record[id]['_09pdist_prow'] = '40 x 25';

                            // Normalize delimiters to 'x'
                            record[id]['_09pdist_prow'] = record[id]['_09pdist_prow'].replace(/[,xX*]/g, 'x');
                            // Remove spaces
                            record[id]['_09pdist_prow'] = record[id]['_09pdist_prow'].replace(/ /g, '');
                            // Split data
                            var size = record[id]['_09pdist_prow'].split('x');
                            record[id]['_09pdist_prow_col'] = size[0];
                            record[id]['_09pdist_prow_row'] = (size.length == 2) ? size[1] : size[0];

                            var value_unit_col = utils.getUnitValue(record[id]['_09pdist_prow_col']);
                            var value_unit_row = utils.getUnitValue(record[id]['_09pdist_prow_row']);

                            // width
                            if(value_unit_col.value <= utils.MAX_CENTIMETER_THRESHOLD && value_unit_col.unit == ''){
                                value_unit_col.unit = utils.DEFAULT_UNIT;
                            }

                            if(value_unit_row.value <= utils.MAX_CENTIMETER_THRESHOLD && value_unit_row.unit == ''){
                                value_unit_row.unit = utils.DEFAULT_UNIT;
                            }          
                            
                            if(value_unit_col.value > utils.MAX_CENTIMETER_THRESHOLD && value_unit_col.unit == ''){
                                value_unit_col.unit = 'cm';
                            }        
                            
                            if(value_unit_row.value > utils.MAX_CENTIMETER_THRESHOLD && value_unit_row.unit == ''){
                                value_unit_row.unit = 'cm';
                            }        
                            
                            record[id]['_09pdist_prow_col'] = utils.convertToCentimeter(value_unit_col.unit, value_unit_col.value);
                            record[id]['_09pdist_prow_row'] = utils.convertToCentimeter(value_unit_row.unit, value_unit_row.value);
                        }
                    }

                    // Encode the keys
                    //var encode_array = ['_fid', 'row','col','cell_id','_07pdate','_08hvdate','_lon','_lat', '_year', '_year_hv','_map'];
                    // Exclude the ff. original fields from the output
                    var exclude_keys = ['_06loc', '_01hvdate','BASAL_QTY','SIDE_QTY','TOP_QTY','_12areapl'];
                    var objtemp = {};
                    for(var id in record){
                        // Exclude rows without _07pdate or _08hvdate
                        if(record[id]['_07pdate'] != '' && record[id]['_08hvdate'] != ''){
                            newcsv += '{';
                            objtemp[id] = {};
                            for(var fbkey in record[id]){
                                if(exclude_keys.indexOf(fbkey) === -1){
                                //if(encode_array.indexOf(fbkey) >= 0){
                                    newcsv += '"' + fbkey + '":"' + utils.cleanField(record[id][fbkey]) + '",';
                                    objtemp[id][fbkey] = utils.cleanField(record[id][fbkey]);
                                }
                            }
                            newcsv = newcsv.substring(0, newcsv.length-1) + '},';
                            this.data_processed.push(objtemp[id]);
                        }
                    }
                }
            }            
        }
        else{
            // New farmer name did not match in any of the existing names
            if(missed.indexOf(new_name.name) === -1)
                missed.push(new_name.name);
            count_missed++;
        }
    }

    // Read associated weather files
    this.readWeatherFiles();
    console.log('matched: ' + count_match + '\nmissed: ' + count_missed + '\nunique_gps: ' + count_gps_all + '\nall-data count: ' +Object.keys(this.data_processed).length);    
};


Dextraction.prototype.appendWeatherData = function(){
    var denom = 0;

    // Append weather variables into each record
    for(var i=0; i<this.data_processed.length; i++){
        var record = this.data_processed[i];

        // Get date parameters
        var doy = utils.getdoy(record.w_growthstg_date);// harvest date: utils.getdoy(record._08hvdate);
        var month = utils.getmonth(record.w_growthstg_date,'-','month');
        var days = utils.getdaysinmonth(record.w_growthstg_date);

        console.log('doy: ' + doy + ', wh_date: ' + record.w_growthstg_date + ', pdate: ' + record._07pdate + ', growthstg: ' + record._11growthstg_clean + 
            '\ndirect-doy: ' + utils.addmonths(record._07pdate, record._11growthstg_clean, 'doy') + ', year_hv: ' + record._yr_obs);

        // Weather variables
        var tmax = 0;
        var tmin = 1000;
        var tavg = 0;
        var ftmax31 = 0;
        var paccum = 0;
        var vp = 0;
        var sr = 0;

        var total_tmin = 0;
        var total_tmax = 0;
        var zero = 0;
        var max_p_zero = 0;
        
        denom = 0;
        
        for(var j=doy; j<(doy+days)-1; j++){
            // Append Tempetature Max
            var cell = this.data_processed[i].cell_id;
            denom++;

            if(this.ref_weather[cell] !== undefined){
                if(Object.keys(this.ref_weather[cell]).length > 0){
                    // Temperature max
                    if(this.ref_weather[cell][j].tmax > tmax)
                        tmax = parseFloat(this.ref_weather[cell][j].tmax);

                    // Temperature min
                    if(this.ref_weather[cell][j].tmin < tmin)
                        tmin = parseFloat(this.ref_weather[cell][j].tmin);  

                    // Average temperatures
                    total_tmax += parseFloat(this.ref_weather[cell][j].tmax);
                    total_tmin += parseFloat(this.ref_weather[cell][j].tmin);

                    // Frequency of days with Tmax >= 31 degrees Celsius
                    if(this.ref_weather[cell][j].tmax >= 31)
                        ftmax31++;

                    // Precipitation accumulated
                    paccum += parseFloat(this.ref_weather[cell][j].p);    

                    // Vapor Pressure
                    vp += parseFloat(this.ref_weather[cell][j].vp);

                    // Solar radiattion
                    sr += parseFloat(this.ref_weather[cell][j].sr);
                    
                    // Precipitation Dry Day; max from the number of consecutive dry days (P=0)
                    if(parseInt(this.ref_weather[cell][j].p) === 0){
                        zero++;
                    }
                    else{
                        if(zero !== 0){
                            if(zero > max_p_zero)
                                max_p_zero = zero;
                            zero = 0;
                        }
                    }
                }  
            }    
            else{
                console.log('WARNING cellid ' + cell + ' is undefined!');
            }        
        }

        this.data_processed[i]['w_tmax'] = parseFloat(tmax);
        this.data_processed[i]['w_tmmin'] = parseFloat(tmin);
        this.data_processed[i]['w_tavg'] = ((total_tmax/denom) + (total_tmin/denom)) / 2;
        this.data_processed[i]['w_drange'] = (total_tmax/denom) / (total_tmin/denom);
        this.data_processed[i]['w_ftmax31'] = ftmax31;
        this.data_processed[i]['w_paccum'] = paccum;
        this.data_processed[i]['w_pdryday'] = max_p_zero;
        this.data_processed[i]['w_vpavg'] = parseFloat(vp/denom);
        this.data_processed[i]['w_solar'] = sr;
    }

    // Write to files
    this.writeFiles();
};


/**`
 * Reads  the weather files into JSON format into ref_weather
 */
Dextraction.prototype.readWeatherFiles = function(){
    var dirname = 'data/weather';
    var self = this;
    var count = 0;

    var wh = [];
    for(var key in this.ref_weather)
        wh.push(key);

    var headers = ['cellid','year','doy','sr','tmin','tmax','vp','ws','p'];

    fs.readdir(dirname, function(err, filenames){
        if(err){
            console.log('error reading directory');
            return;
        }

        filenames.forEach(function(filename){
            if(wh.indexOf(filename) >= 0){
                if(wh.indexOf(filename) >= 0){
                    var instream = fs.createReadStream(dirname + '/' + filename);
                    var rl = readline.createInterface(instream, out);
                    var firstline = true;

                    // Initialize the file record
                    self.ref_weather[filename] = {};
                    var day = 1;
                    var max = utils.isLeapYear('2' + filename.split('.')[1]) ? 366 : 365;

                    rl.on('line', function(line){
                        // Initialize the day
                        self.ref_weather[filename][day] = {};

                        if(firstline){
                            console.log('accessing file ' + filename + ', day: ' + day + ', leap year: ' + max);
                            count++;
                        }
                            
                        if(!firstline){
                            var data = line.split(',');
                            var i = 0;

                            data.forEach(function(value){
                                self.ref_weather[filename][day][headers[i]] = value;
                                i++;
                            });
                            day++;
                        }
                        
                        firstline = false;

                        if(count === wh.length && day >= max){
                            self.appendWeatherData();   
                        }
                    });
                }
            }
        });
    });
};


/**
 * Writes processed data into JSON and CSV files
 */
Dextraction.prototype.writeFiles = function(){
    var csv = '[';
    
    // Write to JSON
    for(var i=0; i<this.data_processed.length; i++){
        var record = this.data_processed[i];
        csv += '{';
        for(var key in this.data_processed[i]){
            csv += '"' + key + '":"' + this.data_processed[i][key] + '",'
        }
        csv = csv.substring(0, csv.length-1);
        csv += '},';
    }

    
    csv = csv.substring(0, csv.length-1) + ']';
    fs.writeFile('./data/data_json.json', JSON.stringify(this.data_processed), function(err){
        if(err){
            console.log('error in writing data');
        }
        else{
            console.log('data was saved!');
        }
    });
    
   // Write JSON string as CSV
   // Get headers
   var headers = utils.getObjectKeys(this.data_processed[0]);

   try{
       const opts = { headers };
       const parser = new json2csv(opts);
       const csv = parser.parse(this.data_processed);

       fs.writeFile('./data/data_csv.csv', csv, function(err){
            if(err){
                console.log('error in writing data');
            }
            else{
                console.log('data was saved!');
            }
        });       
   }
   catch(e){
       console.log('error writing csv');
   }
};


module.exports = new Dextraction();
