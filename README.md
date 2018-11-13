# dextraction
Automated data processing for collected mobile and weather data.

## Version

**Version 2.0.0** was carried on from the original, unmodified *version_1.0.0* used for the 1st batch of data extraction last July 2018. (Original) Output data sets for this version is available at [link](https://trello.com/c/9jHUFKpV). _(private trello board)_

Version 2.0.0 draws the comparison of Isabela and IRRI's weather data using R's `base` plotting graphics.

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
2018/07/26