/**
 * Created by sebastian on 20.11.15.
 */

var express = require("express");
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json());

var arangojs = require('arangojs');
var db = arangojs();
var footballDB = db.useDatabase('FootballWebapplication');

app.get("/clubs", function (req, res) {
    var clubs = footballDB.collection('Club');
    clubs.all().then(function (curser) {
        curser.all().then(function (result) {
            res.json(result);
        });
    });
});

app.get("/players", function (req, res) {
    var clubs = footballDB.collection('Player');
    clubs.all().then(function (curser) {
        curser.all().then(function (result) {
            res.json(result);
        });
    });
});

app.post('/players', function (req, res) {
    console.log(req.body.name);
    res.send(req.body.name);
});

module.exports = app;