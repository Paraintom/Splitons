///<reference path="linq/linq.d.ts"/>
///<reference path="angular.d.ts"/>
///<reference path="Project.ts"/>
///<reference path="Transaction.ts"/>
///<reference path="Balance.ts"/>
///<reference path="SettlementEntry.ts"/>

var splitonsApp = angular.module('splitonsApp', ['ngRoute']);
splitonsApp.controller('FakeDataController', ['$scope', '$routeParams', function($scope, $routeParams) {

    $scope.projectName = $routeParams.projectName;
    var p = getFakeProject();
    $scope.transactions = p.transactions;
    $scope.members = p.members;
    $scope.balances = calculateBalances();
    $scope.settlements = calculateSettlement();


    function calculateBalances() {
        var result: { [id: string] : Balance; } = {};
        //Initialisation
        p.members.forEach(m=>result[m] = new Balance(m,0));
        //Computation
        p.transactions.forEach(t=>{
            result[t.from].amount += t.amount;
            var numberOfDebiter = t.to.length;

            t.to.forEach(debitor=> {
                result[debitor].amount -= (t.amount / numberOfDebiter);
            });
        });
        return result;
    }

    function notFinished(currentBalance) {
        return Enumerable.from(currentBalance).count(function (x) {
                return x.value.amount != 0
            }) > 1;
    }

    function calculateSettlement() {
        var result : SettlementEntry[];
        result = [];
        var currentBalance = calculateBalances();
        //Initialisation

        while(notFinished(currentBalance)) {
            var orderedResults = Enumerable.from(currentBalance)
                .select(function (x) {
                    return x.value
                })
                .where(function (x) {
                    return x.amount != 0
                })
                .orderBy(function (x) {
                    return x.amount
                });
            var biggestDebtor = orderedResults.first();
            var biggestCreditor = orderedResults.last();

            var to = biggestCreditor.member;
            var from = biggestDebtor.member;
            var amount = Math.min(Math.abs(biggestCreditor.amount), Math.abs(biggestDebtor.amount));
            var to = biggestCreditor.member;
            var from = biggestDebtor.member;
            var amount = Math.min(Math.abs(biggestCreditor.amount), Math.abs(biggestDebtor.amount));
            biggestCreditor.amount -= amount;
            biggestDebtor.amount += amount;
            result.push(new SettlementEntry(from, to, amount));
        }
        //result.forEach(o=>console.debug("from:"+o.from+" to:"+o.to+" amount:"+o.amount));
        return result;
    }
}]);


splitonsApp.config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.
            when('/listProjects', {
                templateUrl: 'partials/listProjects.html',
                controller: 'FakeDataController'
            }).
            when('/newProject', {
                templateUrl: 'partials/newProject.html',
                controller: 'FakeDataController'
            }).
            when('/project/:projectName', {
                templateUrl: 'partials/basic.html',
                controller: 'FakeDataController'
            }).
            otherwise({
                redirectTo: '/listProjects'
            });
    }]);
function getFakeProject() {
    var p = new Project("fakeProject");
    p.members.push("jean");
    p.members.push("emeline");
    p.members.push("antoine");
    p.members.push("roger");

    p.transactions.push(new Transaction("jean", ["emeline", "antoine"], "Beer", 20));
    p.transactions.push(new Transaction("emeline", ["jean", "antoine", "roger"], "Cab", 30));
    p.transactions.push(new Transaction("emeline", ["roger"], "chewing gum", 100));
    p.transactions.push(new Transaction("emeline", ["antoine"], "dictionary", 12));
    p.transactions.push(new Transaction("roger", ["emeline"], "a brain", 12));
    p.transactions.push(new Transaction("roger", ["antoine"], "Train", 12));
    return p;
}