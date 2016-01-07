var settings = require('./settings');
var db = require('monk')(settings.ip + ':' + settings.port + '/' + settings.name);




exports.calculateMatches = function (date) {
    console.log("calculateMatches called");
    var promises = [];
    var matchCollection = db.get("Match");
    var actualDate = date;

    matchCollection.find().then(function (matches) {
        //console.log("matchCollection find() called");
        matches.forEach(function (match) {
            if (match.date.getTime() <= actualDate.getTime() && match.played === false) {
                var homeGoals = Math.floor(Math.random() * 5);
                var guestGoals = Math.floor(Math.random() * 5);
                var playerCollection = db.get("Player");
                match.played = true;
                playerCollection.find().then(function (allplayer) {
                    match = addGoals(match, homeGoals, guestGoals, allplayer);
                    //console.log("addGoals called");
                    var clubCollection = db.get("Club");
                    clubCollection.findById(match.homeClub, {}, function (err, club) {
                        if (err) {
                            console.log(err);
                            return;
                        }
                        var homeClub = club;

                        clubCollection.findById(match.guestClub, {}, function (err, club) {
                            if (err) {
                                console.log(err);
                                return;
                            }
                            var guestClub = club;

                            addPoints(match, homeGoals, guestGoals, homeClub, guestClub).then(function () {
                                //console.log("addPoints called");
                                //Er scheint hier nen Problem zu haben da er es nicht in die DB schreibt.
                                matchCollection.updateById(match._id, match, function (err, doc) {
                                    if (err) {
                                        console.log(err);
                                    }
                                });
                            });

                        });
                    });

                });


            }
        });
        Promise.all(promises);
        //DEBUG: console.log("promise done");
    });
};

function addPoints(match, homeGoals, guestGoals, homeClub, guestClub) {
    //console.log("addPoints called");
    var clubCollection = db.get("Club");

    var promises = [];
    //console.log(match.homeClub);


    if (homeGoals - guestGoals > 0) {
        homeClub.points += 3;
        homeClub.scoredGoals += homeGoals;
        homeClub.receivedGoals += guestGoals;
        homeClub.won += 1;
        promises.push(clubCollection.updateById(match.homeClub, homeClub));

        guestClub.scoredGoals += guestGoals;
        guestClub.receivedGoals += homeGoals;
        guestClub.lost += 1;
        promises.push(clubCollection.updateById(match.guestClub, guestClub));
    } else if (homeGoals - guestGoals < 0) {
        homeClub.scoredGoals += homeGoals;
        homeClub.receivedGoals += guestGoals;
        homeClub.lost += 1;
        promises.push(clubCollection.updateById(match.homeClub, homeClub));

        guestClub.points += 3;
        guestClub.scoredGoals += guestGoals;
        guestClub.receivedGoals += homeGoals;
        guestClub.won += 1;
        promises.push(clubCollection.updateById(match.guestClub, guestClub));
    } else {
        homeClub.points += 1;
        homeClub.scoredGoals += homeGoals;
        homeClub.receivedGoals += guestGoals;
        homeClub.draw += 1;
        promises.push(clubCollection.updateById(match.homeClub, homeClub));

        guestClub.points += 1;
        guestClub.scoredGoals += guestGoals;
        guestClub.receivedGoals += homeGoals;
        guestClub.draw += 1;
        promises.push(clubCollection.updateById(match.guestClub, guestClub));
    }
    return Promise.all(promises);
}

function addGoals(match, homeGoals, guestGoals, allPlayers) {
    var playersInHomeClub = [];
    var playersInGuestClub = [];


    allPlayers.forEach(function (player) {
        if (player.clubId.id == match.homeClub.id && homeGoals > 0) {
            playersInHomeClub.push(player);
        } else if (player.clubId.id == match.guestClub.id && guestGoals > 0) {
            playersInGuestClub.push(player);
        }
    });


    match = choosePlayerAndAddPlayerScore(match, true, homeGoals, playersInHomeClub);
    match = choosePlayerAndAddPlayerScore(match, false, guestGoals, playersInGuestClub);

    return match

}

function choosePlayerAndAddPlayerScore(match, isPlayerInHomeClub, goals, playersInClub) {
    try {
        var playerCollection = db.get("Player");
        for (goals; goals > 0; goals--) {
            var playerNumberInArray = Math.floor(Math.random() * (playersInClub.length - 1));

            playersInClub[playerNumberInArray].scoredGoals += 1;
            playerCollection.updateById(playersInClub[playerNumberInArray]._id,playersInClub[playerNumberInArray]);

            if (isPlayerInHomeClub) {
                match.homeGoals.push(playersInClub[playerNumberInArray]._id);
            } else {
                match.guestGoals.push(playersInClub[playerNumberInArray]._id);
            }

        }
    } catch (e) {
        console.log(e);
        if(isPlayerInHomeClub){
            console.log(match.homeClub);
        }else {
            console.log(match.guestClub);
        }
    }
    return match;
}
