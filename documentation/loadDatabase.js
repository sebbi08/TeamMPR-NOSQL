var db = require('arangojs')();
var systemdb = db.useDatabase('_system');
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


        league.create().then(loadLeagues(league));
        match.create().then(createMatchs(match,league));
        club.create().then(loadClubs(club,league,match));
        player.create().then(loadPlayers(player,club));

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
    clubJson.forEach(function(club){
        var leagueId = club.wettbewerbsId;
        var league = leagueId.substring(leagueId.length - 1);
        league = parseInt(league);
        if(league < 3){
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