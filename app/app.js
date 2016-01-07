var express = require("express");
var app = express();

var bodyParser = require('body-parser');
var settings = require('../settings');

var mongo = require('mongodb');

var db = require('monk')(settings.ip + ':' + settings.port + '/' + settings.name);
var calcService = require("../seasonCalculationService");

app.use(bodyParser.json());

var lastCallDate = null;


var date = new Date();

app.all("/*", function (req, res, next) {
    //TODO Calculate Matches that should have been played
    if (lastCallDate === null || ((lastCallDate.getTime() - new Date().getTime()) > 300000)) {
        calcService.calculateMatches(new Date());
        lastCallDate = new Date();
    }
    //console.log("Call to " + req.path);
    next()
});

app.get("/nextWeak",function(req,res){
    date = new Date(date.getTime() + (7 * 24 * 60 * 60 * 1000));

    calcService.calculateMatches(date);
    res.send("OK")
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

app.get("/clubs/league/:id", function (req, res) {
    var clubCollection = db.get("Club");
    clubCollection.find({league: parseInt(req.params.id)}, {}, function (err, data) {
        if (err) {
            console.log(err);
        } else {
            res.json(data);
        }
    });
});


app.get("/clubs/:name", function (req, res) {
    var clubCollection = db.get("Club");
    clubCollection.find({name: req.params.name}, {}, function (err, data) {
        if (err) {
            console.log(err);
        } else {
            res.json(data);
        }
    });
});

app.get("/clubs/id/:id", function (req, res) {
    var clubCollection = db.get("Club");
    clubCollection.findById(req.params.id, {}, function (err, data) {
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

app.get("/players/club/:id", function (req, res) {
    var collection = db.get("Player");
    collection.find({clubId: new mongo.ObjectID(req.params.id)}, {}, function (err, data) {
        if (err) {
            console.log(err);
        } else {
            res.json(data);
        }
    });
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

app.get("/matches/:id", function (req, res) {
    var collection = db.get("Match");
    collection.findById(req.params.id, {}, function (err, data) {
        if (err) {
            console.log(err);
        } else {
            res.json(data);
        }

    });
});

app.get("/matches/league/:id", function (req, res) {
    var collection = db.get("Match");
    var id = parseInt(req.params.id);
    collection.find({league: id}, {}, function (err, data) {
        if (err) {
            console.log(err);
        } else {
            res.json(data);
        }
    });
});

app.get("/matches/club/:id", function (req, res) {
    var collection = db.get("Match");
    collection.find({$or: [{"homeClub": new mongo.ObjectID(req.params.id)}, {"guestClub": new mongo.ObjectID(req.params.id)}]}, {}, function (err, data) {
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
