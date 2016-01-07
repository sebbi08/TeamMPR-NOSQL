app.controller("LeagueController", function ($scope, $http, $location, $route) {
    var leagueId = 0;

    for (var key in $route.routes) {
        if ($route.routes.hasOwnProperty(key)) {
            var route = $route.routes[key];
            if (key === $location.path()) {
                leagueId = route.id;
            }
        }
    }

    $http.get("http://localhost:8080/clubs/league/" + leagueId).then(function (league) {
        $scope.clubs = {};
        league.data.forEach(function (club) {
            $scope.clubs[club._id] = club
        });
    });

    $http.get("http://localhost:8080/matches/league/" + leagueId).then(function (matches) {
        matches = matches.data;
        $scope.matches = matches;
        var dates = [];

        matches.forEach(function (match) {
            if (dates.indexOf(match.date) == -1) {
                dates.push(match.date)
            }
        });
        $scope.dates = [];

        dates.forEach(function (date) {
            $scope.dates.push(new Date(date));
        });

        $scope.matchDays = {};
        $scope.matches.forEach(function (match) {
            match.date = new Date(match.date);
            if($scope.matchDays[match.date.toLocaleDateString()] === undefined){
                $scope.matchDays[match.date.toLocaleDateString()] = [match];
            }else{
                $scope.matchDays[match.date.toLocaleDateString()].push(match);
            }
        });


    });

    $scope.activateSpielplan = function () {
        $scope.spielPlan = true;
        $scope.table = false;
    };

    $scope.activateTable = function () {
        $scope.spielPlan = false;
        $scope.table = true;
    };

    $scope.activateTable();


    $scope.today = new Date();

    $scope.getMatchesForDate = function (date) {
        if($scope.spielPlan){
            var matches = [];
            if ($scope.matches) {
                $scope.matches.forEach(function (match) {
                    var date1 = date.toLocaleDateString();
                    var date2 = new Date(match.date).toLocaleDateString();
                    if (date1 == date2) {
                        matches.push(match);
                    }
                });
            }
            return matches;
        }
    };

    angular.element(document).ready(function(){
        $('.scroll').enscroll({
            scrollIncrement : 80,
            showOnHover: false,
            verticalTrackClass: 'track3',
            verticalHandleClass: 'handle3'
        });
    })

    $scope.allMatchesPlayed = function(date){
        var result = true;
        $scope.matchDays[date.toLocaleDateString()].forEach(function(match){
            if(!match.played) result = false;
        });
        return result;
    }
});

app.controller("ClubController", function ($scope, $http, $routeParams) {
    $http.get("http://localhost:8080/clubs/" + $routeParams.name).then(function (club) {
        $scope.club = club.data[0];
        $http.get("http://localhost:8080/players/club/" + club.data[0]._id).then(function (player) {
            $scope.players = player.data;
            
        })
    });

    $scope.playerVisible = true;
});

app.controller("HeaderController", function ($scope, $location, $route,$http) {
    var routes = [];
    angular.forEach($route.routes, function (route, path) {
        if (route.name) {
            routes.push({
                path: path,
                name: route.name
            });
        }
    });
    $scope.routes = routes;
    $scope.activeRoute = function (route) {
        return route.path === $location.path();
    };

    $scope.nextWeak = function(){
        $http.get("http://localhost:8080/nextWeak")
    }

});

