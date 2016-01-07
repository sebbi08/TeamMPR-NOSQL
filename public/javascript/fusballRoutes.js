app.config(function ($routeProvider) {

    var provider = $routeProvider;

    var redirectTo = "/league/2";

    $.ajax({
        type: "GET",
        url: "http://localhost:8080/leagues",
        async: false,
        success:function(leagues){
            leagues.sort(function(a,b){return a._id-b._id});
            leagues.forEach(function(league,index){
                if(index === 0){
                    redirectTo = "/league/" + (index + 1);
                }
                provider = provider.when("/league/" + (index + 1), {
                    templateUrl: '/views/league.html',
                    controller: "LeagueController",
                    name: league.name,
                    id: league._id
                })
            })
        }
    });

    provider.when("/club/:name",{
        templateUrl: '/views/club.html',
        controller: 'ClubController'
    }).otherwise({
        redirectTo: redirectTo
    })
});