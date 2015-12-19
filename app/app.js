var express = require("express");
var app = express();

var bodyParser = require('body-parser');
var settings = require('../settings');

var db = require('monk')(settings.ip + ':' + settings.port + '/' + settings.name);


app.use(bodyParser.json());

app.all("/*", function (req, res, next) {
    //TODO Calculate Matches that should have been played
    //calculateMatches();
    console.log("Call to " + req.path);
    next()
});

app.get("/matches", function (req, res) {
    var collection = db.get("Match");
    collection.find({}, {}, function (err, data) {
        if (err) {
            console.log(err);
        } else {
            res.json(data);
        }
    });
});

app.get("/clubs", function (req, res) {
    var collection = db.get("Club");
    collection.find({}, {}, function (err, data) {
        if (err) {
            console.log(err);
        } else {
            res.json(data);
        }
    });
});

app.get("/players", function (req, res) {
    var collection = db.get("Player");
    collection.find({}, {}, function (err, data) {
        if (err) {
            console.log(err);
        } else {
            res.json(data);
        }
    });
});

//Todo maybe delete res.send ... is this method needed??
//Answer TODO no is not needet but normaly u give a response if the opersation was succesfull or not and if not provide an error
/*
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
 */


app.get("/leagues", function (req, res) {
    var collection = db.get("League");
    collection.find({}, {}, function (err, data) {
        if (err) {
            console.log(err);
        } else {
            res.json(data);
        }
    });
});


module.exports = app;
