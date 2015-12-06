/**
 * Created by sebastian on 20.11.15.
 */

var express = require("express");
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json());

var arangojs = require('arangojs');
var db = arangojs();
var footballDB = db.useDatabase('FBWebApp');


app.get("/clubs", function (req, res) {
    var clubs = footballDB.collection('Club');
    clubs.all().then(function (curser) {
        curser.all().then(function (result) {
            res.json(result);
        });
    });
});

app.get("/players", function (req, res) {
    var players = footballDB.collection('Player');
    players.all().then(function (curser) {
        curser.all().then(function (result) {
            res.json(result);
        });
    });
});

//Todo maybe delete res.send ... is this method needed??
app.post('/players', function (req, res) {
    var newPlayer = {"name": req.body.name,"surName": req.body.surName,"scoredGoals":"","dateOfBirth": req.body.dateOfBirth};
    var players = footballDB.collection('Player');
    
    players.save(newPlayer, function (err, result) {
        if (err) {
            console.log('error: %j', err.message); 
        } else {
            //console.log('result: %j', result._id);
            res.send(result._id);
        }
    });
});

app.get("/matches", function (req, res) {
    var matches = footballDB.collection('Match');
    matches.all().then(function (curser) {
        curser.all().then(function (result) {
            res.json(result);
        });
    });
});

app.get("/leagues", function (req, res) {
    var leagues = footballDB.collection('League');
    leagues.all().then(function (curser) {
        curser.all().then(function (result) {
            res.json(result);
        });
    });
});

app.get("/trainers", function (req, res) {
    var trainers = footballDB.collection('Trainer');
    trainers.all().then(function (curser) {
        curser.all().then(function (result) {
            res.json(result);
        });
    });
});


module.exports = app;