# /data/weather/*

This directory will contain weather data files in which weather data for a year and month will be extracted. Please contact us for the weather data files at **ciat.ph@gmail.com**.

## Filename 
Weather files start with _"nsch"_ followed by a 6-digit number representing the cell id. The last 3-digits starting after the dot "." represents the year for which the data was taken.

### Breakdown (example)
- `nsch418807.014` is the full weather file name.
 - `nsch` - string prefix
 - `417368` - Cell ID
 - `.014` - year

### Sample Filenames
`nsch417368.002`
`nsch417368`
`...`
`nsch417368.014`
`nsch417368.015`


## Columns

Column data or variables found inside the weather files.

### Column Header Names

1. **Year**
2. **Day of Year (DOY)**
3. **Solar Radiation (SR)**
4. **Temparature Minimun (Tmin)** - Celsius
5. **Temperature Maximum (Tmax)** - Celsius
6. **Vapor Pressure (VP)**
7. **Wind Speed (WS)** - m/s
8. **Precipitation (P)** - mm/d

## File Content
Each weather data file contains a miscellaneous header (which should be ignored when reading), and rows of data. Each row correspond to a day in a year.
<br><br>

### Data Dictionary of Weather Fields to be Generated and Exported

1. **Cell ID** - Cell id in the grid
2. **Tmax** - Maximum Temperature (T)
`Tmax = max(T)`
3. **Tmin** - Minimum Temperature (T)
`Tmin = min(T)`
4. **Taverage** - average of Tmax and Tmin
`Taverage = (AvgTmax + AvgTmin) / 2`
5. **Drange** - Diurned range
`Drange = (AvgTmax - AvgTmin)`
6. **Ftmax31** - frequency of days with Tmax >= 31 degrees Celsius
`Ftmax31 = data[data$Tmax >= 31]`
7. **Paccum** - Precipitation accumulated; monthly total of Precipitation (P)
`Paccum = sum(P)`
8. **Pdryday** - Precipitation Dry Day; max from the number of consecutive dry days (P=0)
`Pdryday = max(dryDaysCountArray[])`
9. **VPavg** - Vapor Pressure Average 
`VPavg = VP / DaysInMonth`
10. **SRaccum** - Solar Radiation Accumulated
`SRaccum = sum(SR)`


#### Last Updated: 
2018/07/31