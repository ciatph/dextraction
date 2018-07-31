library(ggplot2)
library(data.table)

# Working directory where the weather files are
projDir <- 'data_files/'
imageDir <- paste0('image/')
print(imageDir)
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
## Creates low-resolution graphics (uses the standard plot method)
plotGraph <- function(tmax, tmin, precip, index = NULL){
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
  
  par(new = TRUE)
  
  # Graph precipitation
  plot(precip, type='o', col='black', ylim=g_range, axes=FALSE, ann=FALSE)
  
  # Set the ticks interval for the y axis tmax
  axis(2, las=1, at=10*0:g_range[2])  
  
  
  # Create a legend at (1, g_range[2]) that is slightly smaller 
  # (cex) and uses the same line colors and points used by 
  # the actual plots 
  legend(1, g_range[2], c("Tmax","Tmin","Precipitation"), cex=0.8, 
         col=c("red","blue","black"), pch=21:22, lty=1:2);  
  
  # Save the file.
  dev.off()
}


## Plots the tmax and tmin using ggplot2
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
    # geom_point(alpha = 0.5) +
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


## Plots precipitation using ggplot2
plotGraphPrecip <- function(df, index = NULL){
  # Optional unique file index
  file_no <- 'Precipitation';
  
  if(!is.null(index))
    file_no <- paste('Precipitation ', ' for ', index)
  
  g <- melt(df, id.var="doy")
  names(g) <- c('Day', 'Variable', 'Precipitation')
  
  # Output image file
  output_png <- paste0(imageDir, 'precipitation_', index, '.png')
  png(filename=output_png, width=10, height=8, units='in', res=400)
  
  # Plot the graph
  print(ggplot(g, aes(Day, Precipitation)) + geom_smooth(aes(group = Variable, color = Variable), size = 0.45) +
          geom_point(alpha = 0.5) +
          ggtitle(file_no) +
          theme( axis.line = element_line(colour = "black", 
                                          size = 0.4, linetype = "solid")) +
          # scale_x_discrete(limits=c(1:length(df$p))) +
          theme(axis.text.x = element_text(face="bold", color="black", 
                                           size=10, angle=0),
                axis.text.y = element_text(face="bold", color="black", 
                                           size=10, angle=0)))
  
  dev.off()
}


## Plots a simple graph using ggplot2
## @param df: data frame containing data and variables
## @param type: type of graph to render: point|bar
## @param index: optional filename for output image file
plotGraphSimple <- function(df, type, index = NULL){
  # Optional unique file index
  file_no <- 'Precipitation Graph';
  
  # Get the bar type
  graph_type <- 'point' #default
  
  if(!is.null(type))
    graph_type <- type
  
  if(is.null(index))
    index <- 'demo'
  
  if(!is.null(index))
    file_no <- paste('Precipitation ', ' for ', index)
    
  # Output image file
  output_png <- paste0(imageDir, 'precipitation_', index, '.png')
  png(filename=output_png, width=10, height=8, units='in', res=400)
  
  # Get the bar type
  if(graph_type == 'point')
    graph <- geom_point(stat="identity")
  else if(graph_type == 'bar')
    graph <- geom_bar(stat="identity")
  
  names(df) <- c('Precipitation','Day')
  print(ggplot(data=df, aes(x=Day, y=Precipitation)) +
    ggtitle(file_no) +
    graph)  
  
  dev.off()
}


# Plots a single-axis graph using ggplot2
plotGraphSingle <- function(df, index = NULL){
  # Output image file
  output_png <- paste0(imageDir, 'p_', index, '.png')
  png(filename=output_png, width=10, height=8, units='in', res=400)
  
  print(ggplot(df, aes(c(1:length(p)), p)) +
    geom_point() +
    geom_point(data = f, aes(c(1:length(p)), color = 'blue')))
  
  dev.off()
}



## graph analysys R object
## Contains accessible cached data sets
## Contains shorthand method calls for plotting graphs
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
  
  # Retrieve precipitation and doy only as data.frame
  getdataframep <- function(index){
    return(data.frame(p=data[[index]]$p,
                      doy=data[[index]]$doy))
  }
  
  # Plot the tmax and tmin graph using plot
  plotgraph <- function(){
    for(i in 1:length(files)){
      f <- getdatalist(i)
      plotGraph(f$tmin, f$tmax, f$p, files[i])
     }
  }
  
  # Plot the tmax and tmin graphs using ggplot2
  plotgraphview <- function(){
    for(i in 1:length(files)){
      plotGraphView(getdataframetemp(i), files[i])
    }  
  }
  
  # Plot precipitation using ggplot2
  plotgraphprecip <- function(type = NULL){
    graph_type <- 'point'
    
    if(!is.null(type))
      graph_type <- type
    
    for(i in 1:length(files)){
      plotGraphSimple(getdataframep(i), graph_type, files[i])
    } 
  }
  
  return(list(
    load = load,
    getdatalist = getdatalist,
    getdataframe = getdataframe,
    getdataframetemp = getdataframetemp,
    getdataframep = getdataframep,
    plotgraph = plotgraph,
    plotgraphview = plotgraphview,
    plotgraphprecip = plotgraphprecip
  ))
}

## Main program proper
run <- function(){
  # Create an R object that contains data
  d <- wh_object()
  
  # Load data from all files
  d$load()
  
  # Plot the the tmax, tmin and precipitation graphs from files
  # low-resolution graphics
  d$plotgraph()
  
  # Plot the tmax and tmin graphs using ggplot2
  d$plotgraphview()
  
  # Plot the precipitation graph using ggplot2
  d$plotgraphprecip('bar')
}

## Load the script after source()
run()
