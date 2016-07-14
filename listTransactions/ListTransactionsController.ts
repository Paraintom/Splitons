///<reference path="../external/linq.d.ts"/>
///<reference path="../external/angular.d.ts"/>
///<reference path="../dataObjects/Project.ts"/>
///<reference path="../dataObjects/Transaction.ts"/>
///<reference path="../external/bootbox.d.ts"/>

angular.module('splitonsApp').controller(
    'ListTransactionsController', ['$scope', '$routeParams', 'projectsFactory', '$route','$filter','$controller',
        function ($scope, $routeParams, projectsFactory, $route, $filter, $controller) {
            $scope.activeTab =$routeParams.activeTab;
            var p = projectsFactory.getProject($routeParams.projectId);
            //We inherit from the parent (Refactoring)
            $controller('SynchronizeController', {$scope: $scope, $project : p});

            $scope.transactions  = p.transactions;
            $scope.notDeletedTransactions = $filter('filter')( p.transactions, { deleted: false });
            $scope.members = p.members;
            $scope.allCurrencies = calculateAllCurrencies();

            $scope.setSelectedCurrency = function(currency) {
                $scope.selectedCurrency = currency;
            }
            $scope.setSelectedCurrency($scope.allCurrencies[0]);

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
                var allTransactions = Enumerable.from<Transaction>($scope.notDeletedTransactions);
                var inFrom = allTransactions.any(function (x) {
                    return x.from == name;
                });
                var inTo = allTransactions.any(function (x) {
                    return x.to.indexOf(name) >-1;
                });
                return inFrom || inTo;
            }

            var toDelete;
            $scope.deleteTransaction = function(id) {
                for (var index in $scope.transactions) {
                    var currentTransaction = $scope.transactions[index];
                    if (currentTransaction.id == id) {
                        toDelete = currentTransaction;
                        bootbox.confirm({
                            title: 'Delete Transaction?',
                            size: 'small',
                            message: "Are you sure you want to delete the transaction: <b>" + toDelete.comment + "</b>?",
                            callback: function(result){
                                if(result){
                                    //$scope.transactions.splice(index, 1);
                                    toDelete.deleted = true;
                                    toDelete.HasBeenUpdated();
                                    projectsFactory.saveProject(p);
                                    $route.reload();
                                }
                            }
                        });
                    }
                }
            }

            function calculateAllCurrencies() {
                var result = [];
                $scope.notDeletedTransactions.forEach(t=> {
                        var currentCurrency = t.currency;
                        if (result.indexOf(currentCurrency) == -1) {
                            result.push(currentCurrency);
                        }
                    }
                );
                if (result.length == 0) {
                    result.push("");
                }
                return result;
            }
        }]);