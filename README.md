# dextraction
An automated data processing tool for extracting and cleaning collected mobile and weather data.

Creates an output of farming practices variables joined with corresponding weather data based on the last day of the week where pest and disease was observed, minus (N) number of days.

### Version Updates

**Version 3.0.0** was built from `version_1.0.0`. It was originally used for the 1st batch of data extraction last July 2018, with a few modifications on the output columns. (Original) Output data sets for this version is available at [link](https://trello.com/c/9jHUFKpV). _(private trello board)_

- **[NEW]:** added `appendWeatherDataBacktrack()`: iterates over and reads IRRI weather data files based on last day of the week where P&D was observed, down to the date minus (N) number of days. 
- **[NEW]:** updated `utils` with JS Date() utility methods
- draws the comparison of Isabela and IRRI's weather data using R's `gplot2` package.
- updates the firebase GPS records by matching ISU's updated GPS locations with farmer names file to their counterparts synced to firebase.
- extracts and appends IRRI weather data on the full month where P&D was observed to the original cassava data


## Prerequisites
NodeJS must have been installed in your system. Used version as of this writing is Node = v9.2.0, Npm = 5.5.1.

Weather data files must be present in the `data/weather/` directory. Please contact us to obtain the weather data files at **ciat.ph@gmail.com**.

### Dependency Libraries
These are node modules that are used in this project.

- **cors** v.2.8.4
- **json2csv** v.4.1.6
- **path** v.0.12.7
- **request** - v.2.87.0


## Installation/Usage
1. Clone this repository to your local PC, or download as a `.zip` file.
2. Go into the project directory from the command line.
3. Run `npm install`.
4. Start debugging using VS Code, or run `node index.js` from the command line.


## Web Tools

Web tools for 1) finding IRRI's weather data `cell id` using longitude and latitude, and 2) viewing graphs comparing cassava weather data (version 2.0's 30 and 60 days IRRI weather data) are available in `/webtools`.

1. Navigate using the command line to `/webtools`.
2. Run `npm install`.
3. Run `gulp dev`. 


#### Last Updated: 

@ciatph <br>
**Date created:** 2018/07/31 <br>
**Date modified:** 2018/11/20