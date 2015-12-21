app.controller("LeagueController", function ($scope, $http, $location, $route) {
    var leagueId = 0;

    for(var key in $route.routes){
        if($route.routes.hasOwnProperty(key)){
            var route = $route.routes[key];
            if (key === $location.path()) {
                leagueId = route.id;
            }
        }
    }

    $http.get("http://localhost:8080/clubs/league/" + leagueId).then(function (response) {
        $scope.clubs = response.data;
    });
});

app.controller("HeaderController", function ($scope, $location, $route) {
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
});
