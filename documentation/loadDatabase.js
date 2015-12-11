var db = require('monk')('localhost/FBWebApp');

systemdb.dropDatabase("FBWebApp").then(function(){
    createDatabase();
},function(err){
    console.log(err);
    createDatabase();
});


function createDatabase(){
    var db = require('arangojs')();
    db.createDatabase("FBWebApp").then(function(info){
        var footballDB = db.useDatabase('FBWebApp');
        var club = footballDB.collection("Club");
        var league = footballDB.collection("League");
        var match = footballDB.collection("Match");
        var player = footballDB.collection("Player");
        var clubsInLeague = footballDB.edgeCollection("clubsInLeague");
        var creationsPromises = [];


        var leaguePromis = league.create();
        creationsPromises.push(leaguePromis);
        leaguePromis.then(function(){
            creationsPromises.push(loadLeagues(league));
        });

        var clubPromis = club.create();
        creationsPromises.push(clubPromis);
        clubPromis.then(function(){
            creationsPromises.push(loadClubs(club,league));
        });

        var playerPromis = player.create();
        creationsPromises.push(playerPromis);
        playerPromis.then(function(){
            creationsPromises.push(loadPlayers(player,club));
        });

        Promise.all(creationsPromises).then(function(){
            match.create().then(createMatchs(match,league,club));
        });



    },function(err){
        console.log(err)
    });


}


function loadLeagues(leagueCollection) {
    leagueCollection.save({name : "1. Bundesliga"},function (err, result) {
        if(err){
            console.log(err);
        }
    });

    leagueCollection.save({name : "2. Bundesliga"},function (err, result) {
        if(err){
            console.log(err);
        }
    });
}

function loadClubs(clubCollection,leagueCollection,matchCollection){
    var clubJson = require("./clubs.json");
    var finishCounter = 0;
    clubJson.forEach(function(club){
        var leagueId = club.wettbewerbsId;
        var league = leagueId.substring(leagueId.length - 1);
        league = parseInt(league);
        if(league < 3){
            finishCounter++;
            var databaseClub = {
                name : club.langschreibweise,
                shortName : club.dreiBuchstabenCode,
                league : league,
                points:0,
                scoredGoals:0,
                receivedGoals:0
            };

            clubCollection.save(databaseClub,function (err, result) {
                if(err){
                    console.log(err);
                }
            });
        }

    })
}

function loadPlayers(playerCollection,clubCollection){

}

function createMatchs(matchCollection,leagueCollection){
 // macht michael
}