var app = angular.module("FusballApp", ['ngRoute','ui.bootstrap']);

app.filter('orderTeams',function(){
    return function(items, field, reverse) {
        var filtered = [];
        angular.forEach(items, function(item) {
            filtered.push(item);
        });
        filtered.sort(function (a, b) {
            if(a.points != b.points){
                return a.points - b.points;
            }

            var goalDifferenceA = a.scoredGoals/a.receivedGoals;

            var goalDifferenceB = b.scoredGoals/b.receivedGoals;
            if(a.receivedGoals === 0){
                goalDifferenceA = a.scoredGoals*2
            }
            if (b.receivedGoals === 0) {
                goalDifferenceB = b.scoredGoals*2
            }
            if(goalDifferenceA != goalDifferenceB){
                return goalDifferenceA - goalDifferenceB;
            }

            if(a.receivedGoals != b.receivedGoals){
                return a.receivedGoals - b.receivedGoals;
            }
            if(a.receivedGoals != b.receivedGoals){
                return a.receivedGoals - b.receivedGoals;
            }

            return 0;
        });
        if(!reverse) filtered.reverse();
        return filtered;
    };
});