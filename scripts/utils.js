/**
 * String and JS Object parsing Utilities
 */

var Utils = function(){
    // Max value threshold to consider if value is in centimeters
    this.MAX_CENTIMETER_THRESHOLD = 12;

    // Default unit to use for values without given units and are < MAX_CENTIMETER_THRESHOLD
    this.DEFAULT_UNIT = 'm';
};

/**
 * Removes tab characters
 * @param {*} str 
 */
Utils.prototype.cleanField = function(str){
    str = str.toString();
    try{
        str = str.replace(/\t/g, '');
        str = str.replace(/\n/g, '');
    }
    catch(e){
        console.log('error: ' + e + ', replacing: ' + str);
        return str;
    }

    return str;
};


/**
 * Count the object length
 * @param {JS object} obj 
 */
Utils.prototype.getObjectLength = function(obj){
    var count = 0;
    if(obj !== null && obj !== undefined)
      count = Object.keys(obj).length;
    return count;
};


/**
 * Returns an array of 1st-level keys of a JS Object
 * @param {JS Object that can be nested} obj 
 */
Utils.prototype.getObjectKeys = function(obj){
    var keys = [];
    for(var key in obj)
        keys.push(key)
    return keys;
};


/**
 * Extract a requested parameter from a full date
 * @param {Full date following the format: year-month-day separated by a delimiter} date 
 * @param {Separator of full date's year, month and day } delim, default: "-"
 * @param {Parameter to extract from date: year, month, day} param 
 */
Utils.prototype.getmonth = function(date, delim, param){
    var delimiter = (delim !==  null) ? delim : "-";
  
    if(date === "")
        return -1;
  
    if(date.indexOf(delim) === -1)
        return -1;
  
    var parts = date.split(delim);
    switch(param){
        case "year": return parseInt(parts[0]); break;
        case "month": return parseInt(parts[1]); break;
        case "day": return parseInt(parts[2]); break;
        default: return -1; break;
    }
};


/**
 * Returns a date with added number of months
 * @param {JS Date string. Must follow the format yyyy/mm/dd} date 
 * @param {Number of months to add} n 
 * @param {type of date format to return: string|'date' (JS Date Object)|doy} type
 * @param {Character delimiter used to separate date yyyy/mm/dd} delimeter
 */
Utils.prototype.addmonths = function(date, n, type, delimeter){
    // Make the string date a JS Date Object
    var newDate = new Date(date);
    var sep = (delimeter !== undefined) ? delimeter : '/';

    // Add months
    var d = new Date(newDate.setMonth(newDate.getMonth() + n));
    var strDate = d.toLocaleDateString().split(sep);
    
    if(type === 'string'){
        // Return the new date as a string
        return strDate.join('-');
    }
    else if(type === 'date'){
        // Return a Javascript Object string
        return d;
    }
    else if(type === 'doy'){
        // Return the day of year
        console.log('new date: ' + strDate.join('-'));
        return this.getdoy(strDate.join('-'));
    }
};


/**
 * Combine the first and last names all lowercase
 * Assumes there is only (1) numeric value in the string, which is the plot no.
 * @param {Name: first, middle, last name separated by space} strname 
 * Returns a JS object of format:
 * - name: <first_name> + ' ' + <lastname>
 * - plot: 1|2|3
 */
Utils.prototype.normalizeNames = function(strname){
    const longnames = ['dela cruz'];

    var name = strname.toLowerCase();
    var plotno = 1;
    var final_name = '';

	// remove numbers
    var numbers = name.match(/\d+/g);
	if(numbers !== null){
		numbers = (numbers.map(Number) !== undefined) ? numbers.map(Number) : 1;
		for(var j=0; j<numbers.length; j++){
            plotno = numbers[j];
			name = name.replace(numbers[j], '');
		}
    }    

    // combine splitted long surnames defined in _longnames_
    for(var i=0; i<longnames.length; i++){
        if(name.indexOf(longnames[i]) >= 0){
            name = name.replace(longnames[i], longnames[i].replace(/ /g, ''));
        }
    }
    
    // remove extra marks
    var hasParenthesis = (name.indexOf('(') >= 0) ? true : false;
	name = name.replace('()', '');    
    name = name.split(' ');

    // Remove spaces
    for(var i=0; i<name.length; i++){
        name[i] = name[i].replace(/ /g, '');
        name[i].trim();
    }

    if(hasParenthesis){
        final_name = name[0] + name[1];
    }
    else{
        // Has a middle name
        final_name = (name.length === 3) ? 
        name[0] + name[2] :
        name[0] + name[1];
    }

    return {
        name: final_name,
        plot: plotno
    };
};


/**
 * Checks if a year is aleap year or not
 * @param {*Year} year 
 * Returns TRUE|FALSE
 */
Utils.prototype.isLeapYear = function(year){
    return ((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0);
};


/**
 * Returns the number of days in a month considering the leap years
 * @param date  date
 */
Utils.prototype.getdaysinmonth = function(date){
    var datesplit = date.split('-');

    var months = {
        1:"31",
        2:"28",
        3:"31",
        4:"30",
        5:"31",
        6:"30",
        7:"31",
        8:"31",
        9:"30",
        10:"31",
        11:"30",
        12:"31"
    };

    // Check if leap year
    months[2] = this.isLeapYear(datesplit[0]) ? 29 : 28;
    return parseInt(months[datesplit[1]]);
};


/**
 * Get the numerical starting index of a month in a year
 * @param month numerical 1-12 month
 * Returns 1-365
 */
Utils.prototype.getdoy = function(date){
    var datesplit = date.split('-');

    var months = {
        1:"31",
        2:"28",
        3:"31",
        4:"30",
        5:"31",
        6:"30",
        7:"31",
        8:"31",
        9:"30",
        10:"31",
        11:"30",
        12:"31"
    };

    // Check if leap year
    months[2] = this.isLeapYear(datesplit[0]) ? 29 : 28;

    var sum = 0;
    date = date.split('-');

    for(mo in months){
        if(mo < parseInt(date[1])){
            sum += parseInt(months[mo]);
      }
      else{
            break;
        }
    }
    return sum + 1;
};


/**
 * Get the number of months between (2) dates
 * @param {*} date1 
 * @param {*} date2 
 */
Utils.prototype.getmonthdiff = function(date1, date2){
    date1 = new Date(date1);
    date2 = new Date(date2);

    var months = (date2.getFullYear() - date1.getFullYear()) * 12;
    months -= date1.getMonth() + 1;
    months += date2.getMonth();
    return months <= 0 ? 0 : months;
};


/**
 * Converts a given value and metric to hectares
 * @param $metric  metric unit 
 * @param $value 	value
 */
Utils.prototype.convertToCentimeter = function(metric, value){
    var metric = metric.toLowerCase();
    var metric_list = ['cm','ft','m','frpt'];

    // Remove all characters
    var converted = parseFloat(value.replace(/[^0-9,. ]/g,''));

    if(metric_list.indexOf(metric) >= 0){
        if(metric === 'cm'){

        }
        else if(metric === 'm'){
            converted = converted * 100;
        }
        else if(metric === 'ft' || metric === 'fprt'){
            converted = converted * 30.48;
        }
    }
    return converted;
};


/**
 * Accepts a single value-unit pair. Returns the value and unit or blank, if none
 * Checks if a value can be considered for centimeter unit
 * @param data 	single value-unit pair
 */	
Utils.prototype.getUnitValue = function(data){
    var value = data.toLowerCase(data);
    var unit = '';
    var unit = value.replace(/[^a-z ]/g, '');
    var value = value.replace(/[^0-9., ]/g, '');
    
    if(value >= this.MAX_CENTIMETER_THRESHOLD && unit === ''){
        unit = 'cm';
    }

    return {
        value: value,
        unit: unit
    }
};



module.exports = new Utils();