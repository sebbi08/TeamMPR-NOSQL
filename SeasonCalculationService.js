

var settings = require('./settings');
var db = require('monk')(settings.ip + ':' + settings.port + '/' + settings.name);

exports.calculateMatches = function () {
    console.log("calculateMatches called");
    var promises = [];
    var matchCollection = db.get("Match");
    var actualDate = new Date();

    matchCollection.find().then(function (matches) {
        console.log("matchCollection find() called");
        matches.forEach(function (match) {
            if (match.date.getTime() <= actualDate.getTime() && match.played === false) {
                var homeGoals = Math.floor(Math.random() * 5);
                var guestGoals = Math.floor(Math.random() * 5);
                var playerCollection = db.get("Player");

                playerCollection.find().then(function (allplayer) {
                    match = addGoals(match, homeGoals, guestGoals, allplayer);
                    console.log("addGoals called");
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
                                console.log("addPoints called");
                                match.played = true;
                                //Er scheint hier nen Problem zu haben da er es nicht in die DB schreibt.
                                matchCollection.updateById(match._id, match, function (err, doc) {
                                    if (err) {
                                        console.log(err);
                                        return;
                                    }
                                });
                            });

                        });
                    });

                })






                //console.log(match.homeGoals + ":" + match.guestGoals);



                // DEBUG: console.log("date checked" + match.date + " --> " + actualDate + " --> " + homeGoals + " --> " + guestGoals);

            }
        });
        Promise.all(promises);
        //DEBUG: console.log("promise done");
    });
};

function addPoints(match, homeGoals, guestGoals, homeClub, guestClub) {
    //console.log("addPoints called");
    var clubCollection = db.get("Club");

    var promises = []
    //console.log(match.homeClub);



    if (homeGoals - guestGoals > 0) {
        promises.push(clubCollection.updateById(match.homeClub, {
            points: match.homeClub.points + 3,
            scoredGoals: match.homeClub.scoredGoals + homeGoals,
            receivedGoals: match.homeClub.receivedGoals + guestGoals,
            won: match.homeClub.won + 1
        }));
        promises.push(clubCollection.updateById(match.guestClub, {
            scoredGoals: match.guestClub.scoredGoals + guestGoals,
            receivedGoals: match.guestClub.receivedGoals + homeGoals,
            lost: match.guestClub.lost + 1
        }));
    } else if (homeGoals - guestGoals < 0) {
        promises.push(clubCollection.updateById(match.homeClub, {
            scoredGoals: match.homeClub.scoredGoals + homeGoals,
            receivedGoals: match.homeClub.receivedGoals + guestGoals,
            lost: match.homeClub.lost + 1
        }));
        promises.push(clubCollection.updateById(match.guestClub, {
            points: match.homeClub.points + 3,
            scoredGoals: match.guestClub.scoredGoals + homeGoals,
            receivedGoals: match.guestClub.receivedGoals + guestGoals,
            won: match.guestClub.won + 1
        }));
    } else {
        promises.push(clubCollection.updateById(match.homeClub, {
            points: match.homeClub.points + 1,
            scoredGoals: match.homeClub.scoredGoals + homeGoals,
            receivedGoals: match.homeClub.receivedGoals + guestGoals,
            draw: match.homeClub.draw + 1
        }));
        promises.push(clubCollection.updateById(match.guestClub, {
            points: match.homeClub.points + 1,
            scoredGoals: match.guestClub.scoredGoals + guestGoals,
            receivedGoals: match.guestClub.receivedGoals + homeGoals,
            draw: match.guestClub.draw + 1
        }));
    }
    return Promise.all(promises);
}

function addGoals(match, homeGoals, guestGoals, allPlayers) {
    var allPlayers;
    var playersInHomeClub = {};
    var playersInGuestClub = {};


    allPlayers.forEach(function (player) {
        if (player.clubId === match.homeClub && homeGoals > 0) {
            playersInHomeClub.push(player);
        } else if (player.clubId === match.guestClub && guestGoals > 0) {
            playersInGuestClub.push(player);
        }
    });

    match = choosePlayerAndAddPlayerScore(match, true, homeGoals, playersInHomeClub);
    match = choosePlayerAndAddPlayerScore(match, false, guestGoals, playersInGuestClub);

    return match

}

function choosePlayerAndAddPlayerScore(match, isPlayerInHomeClub, goals, playersInClub) {
    for (goals; goals > 0; goals--) {
        var playerNumberInArray = Math.floor(Math.random() * ((playersInClub.length - 1) - 0));
        playersInClub[playerNumberInArray].scoredGoals += 1;

        console.log("PlayerID: " + playersInClub[playerNumberInArray]._id);

        if (isPlayerInHomeClub) {
            match.homeGoals.push(playersInClub[playerNumberInArray]._id);
        } else {
            match.guestGoals.push(playersInClub[playerNumberInArray]._id);
        }
    }
    return match;
}
