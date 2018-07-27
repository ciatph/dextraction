library(ggplot2)
library(data.table)

# Working directory where thee weather files are
projDir <- ''
imageDir <- paste0(projDir, 'image/')
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



## Plots 2 numerical values in (1) graph
## Used for plotting temperature max and temperature min
plotGraph <- function(tmax, tmin, index = NULL){
  # Optional unique file index
  file_no <- '';
  
  if(!is.null(index))
    file_no <- paste0("_", index)
  
  print(paste0(imageDir, "line_char", file_no, ".jpg"))
  
  # Give the chart file a name.
  png(file = paste0(imageDir, "line_char", file_no, ".jpg"), width=1920, height=1080)
  
  # Calculate range from 0 to max value of cars and trucks
  g_range <- range(0, tmax, tmin, precip)     
  
  # Plot the charts. 
  #dev.new(width = 550, height = 330, unit = "px")
  # Plot tmax. Hide the default axes and annotations
  plot(tmax, type='o', col='red', ylim=g_range, axes=FALSE, ann=FALSE)
  
  # Use custom labels for the x-axis (1..365/366) doy
  axis(1, at=1:length(tmax), lab=c(1:length(tmax)))
  
  # Set the ticks interval for the y axis tmax
  axis(2, las=1, at=10*0:g_range[2])  
  
  # Titles
  title(main=paste("Tmax, and Tmin for", index), col.main="red", font.main=4)
  
  # Label the x and y axes with dark green text
  title(xlab="Day of Year", col.lab=rgb(0,0.5,0))
  title(ylab="Value", col.lab=rgb(0,0.5,0))
  
  par(new = TRUE)
  
  # Graph tmin with blue dashed line and square points
  # lines(tmin, type="o", pch=22, lty=2, col='blue') 
  plot(tmin, type='o', col='blue', ylim=g_range, axes=FALSE, ann=FALSE)
  
  # Set the ticks interval for the y axis tmax
  axis(2, las=1, at=10*0:g_range[2])  
  
  
  # Create a legend at (1, g_range[2]) that is slightly smaller 
  # (cex) and uses the same line colors and points used by 
  # the actual plots 
  legend(1, g_range[2], c("Tmax","Tmin"), cex=0.8, 
         col=c("blue","red"), pch=21:22, lty=1:2);  
  
  # Save the file.
  dev.off()
}



## Plots te tmax and tmin using ggplot2
plotGraphView <- function(df, index = NULL){
  # Optional unique file index
  file_no <- 'Minimum and Maximum Temperature';
  
  if(!is.null(index))
    file_no <- paste('Minimum and Maximum Temperature ', ' for ', index)
  
  g <- melt(df, id.var="doy")
  names(g) <- c('Day', 'Variable', 'Temperature')
  
  # Output image file
  output_png <- paste0(imageDir, 'plot_', index, '.png')
  png(filename=output_png, width=10, height=8, units='in', res=400)
  
  # Plot the graph
  print(ggplot(g, aes(Day, Temperature)) + geom_smooth(aes(group = Variable, color = Variable), size = 0.45) +
    geom_point(alpha = 0.5) +
    ggtitle(file_no) +
    theme( axis.line = element_line(colour = "black", 
                                    size = 0.4, linetype = "solid")) +
    #scale_x_discrete(limits=c(1:length(df$tmax))) +
    theme(axis.text.x = element_text(face="bold", color="black", 
                                     size=10, angle=0),
          axis.text.y = element_text(face="bold", color="black", 
                                     size=10, angle=0)))
  
  dev.off()
}



# Plots a single-axis graph using ggplot2
plotGraphSingle <- function(df, index = NULL){
  ggplot(df, aes(c(1:length(tmin)), tmin)) +
    geom_point() +
    geom_point(data = f, aes(c(1:length(tmin)), colour = 'blue'))
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
    return (data[[index]])
  }
  
  ## Retrive tmax, tmin, precipitation and doy columns
  getdataframe <- function(index){
    return(data.frame(tmax=data[[index]]$tmax, 
                    tmin=data[[index]]$tmin, 
                    p=data[[index]]$p, 
                    doy=c(1:length(data[[index]]$tmax))));
  }
  
  ## Retrive tmax, tmin and doy columns
  getdataframetemp <- function(index){
    return(data.frame(tmax=data[[index]]$tmax, 
                    tmin=data[[index]]$tmin,
                    doy=c(1:length(data[[index]]$tmax))));
  }
  
  # Plot the tmax and tmin graph using plot
  plotgraph <- function(){
    for(i in 1:length(files)){
      plotGraph(getdatalist(i)$tmin, getdatalist(i)$tmax, files[i])
     }
  }
  
  # Plot the tmax and tmin graphs using ggplot2
  plotgraphview <- function(){
    for(i in 1:length(files)){
      plotGraphView(getdataframetemp(i), files[i])
    }  
  }
  
  return(list(
    load = load,
    getdatalist = getdatalist,
    getdataframe = getdataframe,
    getdataframetemp = getdataframetemp,
    plotgraph = plotgraph,
    plotgraphview = plotgraphview
  ))
}

## Main program proper
run <- function(){
  # Create an R object that contains data
  d <- wh_object()
  
  # Load data from all files
  d$load()
  
  # Plot the graphs from files
  # d$plotgraph()
  
  # Plot the tmax and tmin graphs using ggplot2
  d$plotgraphview()
}

## Load the script after source()
run()
