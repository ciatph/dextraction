## processing/

This directory contains a set of JS scripts settings that are used for CIAT's current cassava data processing and extraction.

1. **app-dextraction.js** <br>
	- downloads final firebase cassava data
	- merges firebase data with ISU's updated GPS points matched to farmer names
	- Cleans data
	- Attaches IRRI weather variables 

2. **app-csvcompare.js**
	- compare (2) csv files: `data_csv.csv`(dextraction output) and raw data appended with soil variables, using common column headers `_lon` and `_lat` for unique row identifiers.
	- Create a new CSV file: append column `_03yieldhect`, and (15, 30, 45, 60) weather variables from `data_csv.csv` to the raw data with soil variables.

@ciatph <br>
**Date created:** 20181130 <br>
**Date modified:** 20181130 