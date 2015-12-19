app.controller("LeagueController",function($scope, $http){
    $http.get("http://localhost:8080/clubs").then(function(response){
        $scope.data = response.data;
    });

});