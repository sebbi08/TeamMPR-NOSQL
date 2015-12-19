app.config(function ($routeProvider) {

    var provider = $routeProvider;

    var redirectTo = "/league/2";

    $.ajax({
        type: "GET",
        url: "http://localhost:8080/leagues",
        async: false,
        success:function(leagues){
            leagues.forEach(function(league,index){
                console.log(index + ". LOG");
                if(index === 0){
                    redirectTo = "/league/" + (index + 1);
                }
                provider = provider.when("/league/" + (index + 1), {
                    templateUrl: '/views/home.html',
                    controller: "LeagueController",
                    name: league.name,
                    id: league._id
                })
            })
        }
    });

    provider.otherwise({
        redirectTo: redirectTo
    });
    console.log("LAST LOG")
});