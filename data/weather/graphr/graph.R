# Working directory where thee weather files are
projDir <- ''
files <- c('nsch421688.014','nsch421688.015','nsch421688.016','nsch421689.014','nsch421689.016')

## Load text file data 
## Return as a data.frame
loadData <- function(filename, type = NULL, path=NULL){
  # Check if file exists
  file_path = projDir
  file_type <- 'table'
  
  if(!is.null(type))
    file_type = type
  
  if(!is.null(path))
    file_path = path
  
  # File path with the file name
  uri <- paste0(file_path, filename);
  print(paste0('loading file', uri))
  
  # Check if file exists. Stop program execution on error
  if(!file.exists(uri)){
    print("Error loading data, file does not exist.")
    stop()
  }

  
  if(file_type == 'table')
    t <- read.table(uri)
  else
    t <- read.csv(uri, sep = ',')
  
  return (t)
}


## Plots 3 numerical values in (1) graph
## Used for plotting temperature max, temperature min and precipitation
plotGraph <- function(tmax, tmin, precip, index = NULL){
  # Optional unique file index
  file_no <- '';
  
  if(!is.null(index))
    file_no <- paste0("_", index)
  
  # Calculate range from 0 to max value of cars and trucks
  g_range <- range(0, tmax, tmin, precip)  
  
  print(paste0("line_chart", file_no, ".jpg"))
  
  # Give the chart file a name.
  # png(file = paste0("line_chart", file_no, ".jpg"))
  
  # Plot the charts. 
  dev.new(width = 550, height = 330, unit = "px")

  plot(tmax, type="o", col="blue", ylim=c(0,max(tmax)))
  par(new = TRUE)
  plot(tmin, type="o", col="red", ylim=c(0,max(precip)))
  par(new = TRUE)
  plot(precip, type="o", col="orange", ylim=c(0,max(precip)))
  
  # Titles
  title(main=paste("Tmax, Tmin and Precipitation for", index), col.main="red", font.main=4)
  
  # Label the x and y axes with dark green text
  title(xlab="Values", col.lab=rgb(0,0.5,0))
  title(ylab="Day of Year", col.lab=rgb(0,0.5,0))
  
  # Create a legend at (1, g_range[2]) that is slightly smaller 
  # (cex) and uses the same line colors and points used by 
  # the actual plots 
  legend(1, g_range[2], c("Tmax","Tmin", "Precipitation"), cex=0.8, 
         col=c("blue","red", "Orange"), pch=21:22, lty=1:2);  
  
  # Make x axis using Mon-Fri labels
  axis(1, at=1:length(tmax), lab=c(1:length(tmax)))
  
  # Make y axis with horizontal labels that display ticks at 
  # every 4 marks. 4*0:g_range[2] is equivalent to c(0,4,8,12).
  axis(2, las=1, at=4*0:g_range[2])  
  
  # Save the file.
  # dev.off()
}


## graph analysys R object
## Contains accessible cached data sets
wh_object <- function(){
  data <- list();
  
  ## Load all weather data
  load <- function(){
    for(i in 1:length(files)){
      print(files[i])
      data[[i]] <<- loadData(files[i], 'csv')
    }    
  }
  
  ## Get the cached weather data contents at index
  ## @param index: 
  getdatalist <- function(index){
    print(index)
    return (data[[index]])
  }
  
  return(list(
    load = load,
    getdatalist = getdatalist
  ))
}

## Main program proper
run <- function(){
  # Create an R object that contains data
  d <- wh_object()
  
  # Load data from all files
  d$load()
  
  # Plot the graphs from files
  for(i in 1:length(files)){
    print(i)
    plotGraph(d$getdatalist(i)$tmin,d$getdatalist(i)$tmax,d$getdatalist(i)$p, files[i])
  }  
}

## Load the script after source()
run()
