///<reference path="linq/linq.d.ts"/>
///<reference path="angular.d.ts"/>
///<reference path="Project.ts"/>
///<reference path="Transaction.ts"/>
///<reference path="Balance.ts"/>
///<reference path="SettlementEntry.ts"/>

var splitonsApp = angular.module('splitonsApp', ['ngRoute', 'projectsFactory','checklist-model']);

splitonsApp.controller(
    'ProjectController', ['$scope', '$routeParams', 'projectsFactory', '$route',
        function ($scope, $routeParams, projectsFactory,$route) {
            $scope.activeTab =$routeParams.activeTab;
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
                $route.reload();
            }

            $scope.deleteMember = function(name) {
                if(!$scope.existInTransactions(name)) {
                    for (var index in $scope.members) {
                        if ($scope.members[index] == name) {
                            $scope.members.splice(index, 1);
                            projectsFactory.saveProject(p);
                        }
                    }
                    $route.reload();
                }
            }

            $scope.existInTransactions = function(name) {
                var allTransactions = Enumerable.from<Transaction>($scope.transactions);
                var inFrom = allTransactions.any(function (x) {
                    return x.from == name;
                });
                var inTo = allTransactions.any(function (x) {
                    return x.to.indexOf(name) >-1;
                });
                return inFrom || inTo;
            }
            $scope.getBalance = function(name) {
                var allBalances = Enumerable.from($scope.balances).select(function (x) {return x.value;});
                var ba = Enumerable.from<Balance>(allBalances).firstOrDefault(function (x) {
                    return x.member == name;
                });
                return ba.amount;
            }

            $scope.deleteTransaction = function(id) {
                for (var index in $scope.transactions) {
                    if ($scope.transactions[index].id == id) {
                        $scope.transactions.splice(index, 1);
                        projectsFactory.saveProject(p);
                    }
                }
                $route.reload();
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
    'ListProjectsController', ['$scope', 'projectsFactory', '$location',
        function ($scope, projectsFactory, $location) {
            $scope.projectNames =  Enumerable.from<Project>(projectsFactory.getAllProject()).select(function (x) {
                return x.name;
            }).toArray();

            $scope.createProject = function() {
                var newProject = projectsFactory.getNewProject($scope.newProjectName);
                $location.path('/project/'+$scope.newProjectName+"/1").replace();
            }
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
                if(isNaN($scope.amount)){
                    return true;
                }
                transac.from = $scope.selectedCreditor;
                transac.to = $scope.selectedDebtors.slice(0);
                transac.comment = $scope.comment;
                transac.amount = parseFloat($scope.amount);
                if($routeParams.transactionId == 0/*mean a new transaction*/) {
                    project.transactions.push(transac);
                }
                projectsFactory.saveProject(project);
                $location.path('/project/'+$scope.projectName+"/2").replace();
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
            when('/', {
                templateUrl: 'partials/listProjects.html',
                controller: 'ListProjectsController'
            }).
            when('/newProject', {
                templateUrl: 'partials/newProject.html',
                controller: 'CreateProjectController'
            }).
            when('/project/:projectName/:activeTab', {
                templateUrl: 'partials/basic.html',
                controller: 'ProjectController'
            }).
            when('/project/:projectName/:transactionId/transaction', {
                templateUrl: 'partials/transaction.html',
                controller: 'TransactionController'
            }).
            otherwise({
                redirectTo: '/'
            });
    }]);
