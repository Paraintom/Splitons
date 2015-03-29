///<reference path="linq/linq.d.ts"/>
///<reference path="angular.d.ts"/>
///<reference path="Project.ts"/>
///<reference path="Transaction.ts"/>
///<reference path="Balance.ts"/>
///<reference path="SettlementEntry.ts"/>

var splitonsApp = angular.module('splitonsApp', ['ngRoute', 'projectsFactory','checklist-model']);

splitonsApp.controller(
    'ProjectController', ['$scope', '$routeParams', 'projectsFactory',
        function ($scope, $routeParams, projectsFactory) {
            var p = projectsFactory.getProject($routeParams.projectName);
            $scope.projectName = p.name;
            $scope.transactions = p.transactions;
            $scope.members = p.members;
            $scope.balances = calculateBalances();
            $scope.settlements = calculateSettlement();

            $scope.addMember = function(){
                if(p.members.indexOf($scope.newMember) == -1)
                {
                    p.members.push($scope.newMember);
                    projectsFactory.saveProject(p);
                }
            }

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
                    if(bug(currentBalance)){
                        throw new Error("Bug in calculateSettlement, the balance was not balanced!" + currentBalance);
                        //return [];
                    }
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
            function bug(currentBalance) {
                var allPositive =  Enumerable.from(currentBalance).all(function (x) {
                        return x.value.amount >= 0
                    });
                var allNegative =  Enumerable.from(currentBalance).all(function (x) {
                    return x.value.amount <= 0
                });
                return allPositive || allNegative;
            }
        }]);

splitonsApp.controller(
    'ListProjectsController', ['$scope', 'projectsFactory',
        function ($scope, projectsFactory) {
            $scope.projectNames =  Enumerable.from<Project>(projectsFactory.getAllProject()).select(function (x) {
                return x.name;
            }).toArray();
        }]);

splitonsApp.controller(
    'TransactionController', ['$scope', '$routeParams', '$location', 'projectsFactory',
        function ($scope, $routeParams, $location, projectsFactory) {
            var project = projectsFactory.getProject($routeParams.projectName);
            var transac = getTransaction(project,$routeParams.transactionId);

            $scope.projectName = project.name;
            $scope.members = project.members;

            $scope.selectedCreditor = transac.from;
            $scope.selectedDebtors = transac.to.slice(0);
            $scope.amount = transac.amount;
            $scope.comment = transac.comment;

            $scope.addTransaction = function() {
                transac.from = $scope.selectedCreditor;
                transac.to = $scope.selectedDebtors.slice(0);
                transac.comment = $scope.comment;
                transac.amount = parseFloat($scope.amount);
                if($routeParams.transactionId == 0/*mean a new transaction*/) {
                    project.transactions.push(transac);
                }
                projectsFactory.saveProject(project);
                $location.path('/project/'+$scope.projectName).replace();
            }
            function getTransaction(project, transactionId){
                var orderedResults = Enumerable.from<Transaction>(project.transactions);
                var existing = orderedResults.where(
                    function (o) {return o.id == transactionId}
                ).firstOrDefault();
                var result = existing != null ? existing : new Transaction(project.members[0], project.members.slice(0), "", 0);
                return result;
            }
        }]);

splitonsApp.controller(
    'CreateProjectController', ['$scope', '$location', 'projectsFactory',
        function ($scope, $location, projectsFactory) {
            $scope.createProject = function() {
                var newProject = projectsFactory.getNewProject($scope.newProjectName);
                $location.path('/project/'+$scope.newProjectName).replace();
            }
        }]);

splitonsApp.config(['$routeProvider',
    function ($routeProvider) {
        $routeProvider.
            when('/listProjects', {
                templateUrl: 'partials/listProjects.html',
                controller: 'ListProjectsController'
            }).
            when('/newProject', {
                templateUrl: 'partials/newProject.html',
                controller: 'CreateProjectController'
            }).
            when('/project/:projectName', {
                templateUrl: 'partials/basic.html',
                controller: 'ProjectController'
            }).
            when('/project/:projectName/:transactionId/transaction', {
                templateUrl: 'partials/transaction.html',
                controller: 'TransactionController'
            }).
            otherwise({
                redirectTo: '/listProjects'
            });
    }]);
