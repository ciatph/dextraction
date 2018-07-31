# dextraction
An automated data processing tool for extracting and cleaning collected mobile and weather data.

Creates an output of farming practices variables joined with corresponding weather data based on planting date plus number of months after pest & disease has been observed.

## Prerequisites
NodeJS must have been installed in your system. Used version as of this writing is Node = v9.2.0, Npm = 5.5.1.

Weather data files must be present in the `data/weather/` directory. Please contact us to obtain the weather data files at **ciat.ph@gmail.com**.

## Installation
1. Go into the project directory from the commandline.
2. Run npm install.
3. Start debugging using VS Code, or run `node index.js` from the command line.

## Dependency Libraries
These are node modules that are used in this project.

- **cors** v.2.8.4
- **json2csv** v.4.1.6
- **path** v.0.12.7
- **request** - v.2.87.0

#### Last Updated: 
2018/07/31