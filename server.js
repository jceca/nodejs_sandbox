/**
 * Created by gr1 on 03/03/2015.
 */
var http =  require('http'), // Built-in http module provides HTTP server and client functionality
    fs   =  require('fs'),
    path =  require('path'), // Built-in path module provides filesystem path–related functionality
    mime =  require('mime'), // Add-on mime module provides ability to derive a MIME type based on a filename extension

    cache = {}; // cache object is where the contents or cached files are stored

    /* Three helper functions used to serving static HTTP files */

// This function handles the sending of 404 errors when a file is requested that doesn't exists
function send404(response){
    response.writeHead(404, {'Content-Type': 'text/plain'});
    response.write('Error 404: resource not found');
    response.end();
}

// Serving file data
function sendFile(response, filePath, fileContents){
    response.writeHead(200, {'content-type': mime.lookup(path.basename(filePath))});
    response.end(fileContents);
}

// Determine whether or not a file is cached and, if so, serves it.
function serveStatic(response, cache, absPath){
    if (cache[absPath]){
        sendFile(response, absPath, cache[absPath]);
    } else {
        fs.exists(absPath, function (exists) {
            if (exists) {
                fs.readFile(absPath, function (err, data) {
                    if (err) {
                        send404(response);
                    } else {
                        cache[absPath] = data;
                        sendFile(response, absPath, data);
                    }
                })
            } else {
                send404(response);
            }
        });
    }
}

/* CREATING HTTP SERVER */
// Create HTTP server, using anonymous function to define per-request behavior
var server = http.createServer(function(request, response){
    var filePath = false;

    if(request.url == '/'){
        filePath = 'public/index.html'; //Determine HTML file tybe served by default
    } else {
        filePath = 'public' + request.url; // Translate URL path to relative file path
    }
    var absPath = './' + filePath;
    serveStatic(response, cache, absPath); // Serve static file
});

// Provide an already defined HTTP server so it can share the same TCP/IP port
var chatServer = require('./lib/chat_server');
chatServer.listen(server);



server.listen(3000, function(){
    console.log("Server listening on port 3000");
});