var settings = require("../settings");
var mongo = require('mongodb');
var mongoClient = mongo.MongoClient;
var url = 'mongodb://' + settings.ip + ':' + settings.port + '/' + settings.name + '';
var Chance = require("chance");
var chance = new Chance();
mongoClient.connect(url, function (err, db) {
    if (err) {
        console.log(err);
        return;
    }
    var promises = [];
    promises.push(db.collection('Club').drop());
    promises.push(db.collection('Player').drop());
    promises.push(db.collection('Match').drop());
    promises.push(db.collection('League').drop());

    Promise.all(promises).then(createDatabase());
});


function createDatabase() {
    var db = require('monk')(settings.ip + ':' + settings.port + '/' + settings.name);
    var clubCollection = db.get("Club");
    var playerCollection = db.get("Player");
    var matchCollection = db.get("Match");
    var leagueCollection = db.get("League");


    //First of creating LeaLeagues becaus they got no dependencys
    loadLeagues(leagueCollection).then(function () {

        //getting the id's for the two leagues
        var ersteBundesligaId, zweiteBundesligaId;
        leagueCollection.find({}, {stream: true}).each(function (doc) {
            if (doc.name.contains("1")) {
                ersteBundesligaId = doc._id;
            } else {
                zweiteBundesligaId = doc._id;
            }
        }).success(function () {

            //after getting the ids loading the clubs from json and connecting them to one of the two leagues
            loadClubs(clubCollection, [ersteBundesligaId, zweiteBundesligaId]).then(function () {

                //load all clubs to use the id's in the loadPlayer Method
                clubCollection.find().then(function (clubs) {

                    // load players from json and connecting them to the Club via ID
                    loadPlayers(playerCollection, clubs).then(function () {

                        clubCollection.find().then(function (clubs) {
                            createMatchesForBothLeagues(matchCollection, clubs).then(function () {
                                db.close();
                                console.log("Database Created");
                            })
                        });
                    });
                });
            });
        });
    });
}

function loadLeagues(leagueCollection) {
    var promises = [];
    var promise1 = leagueCollection.insert({name: "1. Bundesliga", _id: 1});
    promise1.then(function (result, err) {
        if (err) {
            console.log(err);
        }
    });

    promises.push(promise1);

    var promise2 = leagueCollection.insert({name: "2. Bundesliga", _id: 2});
    promise2.then(function (result, err) {
        if (err) {
            console.log(err);
        }
    });

    promises.push(promise2);

    return Promise.all(promises);
}

function loadClubs(clubCollection, leagueId) {
    var clubJson = require("./clubs.json");
    var clubImages = require("./clubLogos.json");
    var clubPromises = [];


    clubJson.forEach(function (club) {

        //convert wettbewerbsId to league number 1 = 1. Bundesliga , 2 = 2. Bundesliga
        var wettbewerbsId = club.wettbewerbsId;
        var league = wettbewerbsId.substring(wettbewerbsId.length - 1);
        league = parseInt(league);

        //if club is in league 1 or 2 creat him connect him to the league and save him to the database
        if (league < 3) {

            var databaseClub = {
                name: club.langschreibweise,
                shortName: club.dreiBuchstabenCode,
                league: leagueId[league - 1],
                points: 0,
                scoredGoals: 0,
                receivedGoals: 0,
                won:0,
                lost:0,
                imageUrl: "http:" + clubImages[club.id].logo40,
                trainer: chance.last() + ", " + chance.first()
            };
            var promis = clubCollection.insert(databaseClub).then(function (result, err) {
                if (err) {
                    console.log(err);
                }
            });
            clubPromises.push(promis);
        }
    });

    return Promise.all(clubPromises)
}

function loadPlayers(playerCollection, clubs) {

    var playerJson = require("./players.json");

    var promises = [];

    var map = [];

    playerJson.forEach(function (playerJson) {

        //if the player is in no club ignore him
        if (playerJson.club.length != 0) {


            for (var i = 0; i < clubs.length; i++) {
                var club = clubs[i];

                //if the player is in the current club creat him, connect him to the club wia its id and write the Object to the database
                if (club.name === playerJson.club) {
                    var age = Math.floor(Math.random() * (36 - 16) + 16);

                    var player = {
                        name: playerJson.name.split(" ")[0],
                        age: age,
                        scoredGoals: 0,
                        sureName: playerJson.name.split(" ")[1],
                        clubId: club._id
                    };

                    map[club._id.id] = map[club._id.id] === undefined ? 0 : map[club._id.id] + 1;

                    if (map[club._id.id] < 15) {
                        promises.push(playerCollection.insert(player))
                    }

                }
            }
        }
    });

    return Promise.all(promises)
}

//TODO ggf. dynamisch machen indem man als Parameter noch die Liga angibt, sinnvoll? --> müsste dann beim Befüllen der DB zwei mal aufgerufen werden (einmal für die 1. und einmal für die 2. Liga)
function createMatchesForBothLeagues(matchCollection, clubs) {


    var promise = [];

    var firstLeagueClubs = [];
    var secondLeagueClubs = [];

    clubs.forEach(function (club) {
        if (club.league === 1) {
            firstLeagueClubs.push(club);
        } else {
            secondLeagueClubs.push(club);
        }
    });

    promise.push(createBackAndForthMatches(matchCollection, firstLeagueClubs));

    promise.push(createBackAndForthMatches(matchCollection, secondLeagueClubs));

    return Promise.all(promise)
}

function createBackAndForthMatches(matchCollection, allClubs) {
    var leagueStartDate = new Date();


    var promises = [];

    //Set start date (first saturday from now)
    if (leagueStartDate.getDay() < 6) {
        var nextMatchDay = (6 - leagueStartDate.getDay()) * (24 * 60 * 60 * 1000) + leagueStartDate.getTime();
        leagueStartDate.setTime(nextMatchDay);
        leagueStartDate.setHours(15);
        leagueStartDate.setMinutes(30);
        leagueStartDate.setSeconds(0);
        leagueStartDate.setMilliseconds(0);
    }

    var matchdays = require("./matches.json");

    var forthMatchDate = new Date(leagueStartDate.getTime());
    matchdays.forEach(function (matchDay) {
        var spiele = [];
        spiele.push(matchDay.spiel1);
        spiele.push(matchDay.spiel2);
        spiele.push(matchDay.spiel3);
        spiele.push(matchDay.spiel4);
        spiele.push(matchDay.spiel5);
        spiele.push(matchDay.spiel6);
        spiele.push(matchDay.spiel7);
        spiele.push(matchDay.spiel8);
        spiele.push(matchDay.spiel9);

        spiele.forEach(function (spiel) {
            var homeClub = allClubs[spiel.mannschaft1 - 1];
            var guestClub = allClubs[spiel.mannschaft2 - 1];
            promises.push(matchCollection.insert({
                homeClub: homeClub._id,
                guestClub: guestClub._id,
                date: forthMatchDate,
                league: homeClub.league,
                homeGoals : [],
                guestGoals : []
            }));
        });

        forthMatchDate = new Date(forthMatchDate.getTime() + (7 * 24 * 60 * 60 * 1000));
    });

    return Promise.all(promises);
}

String.prototype.contains = function (it) {
    return this.indexOf(it) != -1;
};
