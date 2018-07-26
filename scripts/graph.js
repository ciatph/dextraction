const fs = require('fs');
const http = require('http');

// Express
/*
var express = require('express');
var app = express();

app.use(express.static('./'));
var server = app.listen(3000);
*/

/**
 * Start the server and load web page
 */
const app = http.createServer((req, res) => {
    fs.readFile('./public/webgraph/graph.html', 'utf-8', function(err, data){
        res.writeHead(200, {"Content-Type": "text/html"});
        res.write(data);
        res.end();
    });
});

app.listen(3000, () => {
    console.log('App listening on port 3000!');
});
