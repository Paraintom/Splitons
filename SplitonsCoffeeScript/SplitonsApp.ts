///<reference path="linq/linq.d.ts"/>
///<reference path="angular.d.ts"/>
///<reference path="Project.ts"/>
///<reference path="Transaction.ts"/>
///<reference path="Balance.ts"/>
///<reference path="SettlementEntry.ts"/>

var splitonsApp = angular.module('splitonsApp', ['ngRoute', 'projectsFactory']);

splitonsApp.controller(
    'FakeDataController', ['$scope', '$routeParams', 'projectsFactory',
        function ($scope, $routeParams, projectsFactory) {
            var p = projectsFactory.get($routeParams.projectName);
            $scope.projectName = p.name;
            $scope.transactions = p.transactions;
            $scope.members = p.members;
            $scope.balances = calculateBalances();
            $scope.settlements = calculateSettlement();


            function calculateBalances() {
                var result:{ [id: string] : Balance; } = {};
                //Initialisation
                p.members.forEach(m=>result[m] = new Balance(m, 0));
                //Computation
                p.transactions.forEach(t=> {
                    result[t.from].amount += t.amount;
                    var numberOfDebiter = t.to.length;

                    t.to.forEach(debitor=> {
                        result[debitor].amount -= (t.amount / numberOfDebiter);
                    });
                });
                return result;
            }

            function calculateSettlement() {
                var result:SettlementEntry[];
                result = [];
                var currentBalance = calculateBalances();
                //Initialisation

                while (notFinished(currentBalance)) {
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

            function notFinished(currentBalance) {
                return Enumerable.from(currentBalance).count(function (x) {
                        return x.value.amount != 0
                    }) > 1;
            }
        }]);


splitonsApp.config(['$routeProvider',
    function ($routeProvider) {
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