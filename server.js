#!/usr/bin/env node

/**
 * Module dependencies.
 */

var http = require('http');
var app = require("./app/app.js");
var express = require("express");

//Static Routes for Public folder
app.use('/', express.static(__dirname + '/public'));

var port = 8080 || process.env.port;
var ip = "localhost" || process.env.ip;
app.set('port', port);
app.set('ip',ip);
//app.use(bodyParser.json());


/**
 * Create HTTP server.
 */

var server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */
app.listen(process.env.port || app.get('port'), function(){
    console.log("Express server listening on port %d in %s mode \n http://%s:%d",
        app.get('port'), app.settings.env,app.get('ip'),app.get('port'));
});
