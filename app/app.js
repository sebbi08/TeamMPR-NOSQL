/**
 * Created by sebastian on 20.11.15.
 */

var express = require("express");
var app = express();

app.get("/",function(req,res){
    res.send("HALLO")
});

module.exports = app;