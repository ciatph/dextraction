#/data/weather/graph_files*
<br>


## About

This directory will contain modified weather data files found in the parent directory _/data/weather/_. Column headers of weather files in this directory have been modified to contain a label for each column in order:

- `cellid`- Weather data cell id
- `year`- year
- `doy`- day of year (1..365/366)
- `sr`- solar radiation
- `tmin`- Minimum Temperature
- `tmax`- Maximum Temperature
- `vp`- Vapor Pressure
- `ws`- Wind Speed
- `p`- Precipitation

The modified weather files in this directory will be used to plot graphs in R using the `graph.R` script.

 Please contact us to get access for the weather data files at **ciat.ph@gmail.com**.

## Usage

1. Open R Studio and set `_/data/weather/graphr/` as the working directory.
2. Type `source("graph.R")` in the R commandline.
3. Wait for graphs to be generated.


#### Last Updated: 
2018/07/26