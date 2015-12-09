#!/usr/bin/env node

/**
 * Module dependencies.
 */

var http = require('http');
var app = require("./app/app.js");
var express = require("express");

//Static Routes for Public folder
app.use('/', express.static(__dirname + '/public'));
console.log(__dirname + '/public');

var port = 8080;
app.set('port', port);

/**
 * Create HTTP server.
 */

var server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */
app.listen(process.env.port || app.get('port'), function(){
    console.log("Express server listening on port %d in %s mode",
        app.get('port') || process.env.port, app.settings.env);
});