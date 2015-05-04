///<reference path="../linq/linq.d.ts"/>
///<reference path="../angular.d.ts"/>
///<reference path="../dataObjects/Project.ts"/>
///<reference path="../dataObjects/Transaction.ts"/>
///<reference path="../Balance.ts"/>
///<reference path="../SettlementEntry.ts"/>
angular.module('splitonsApp').controller(
    'TransactionController', ['$scope', '$routeParams', '$location', 'projectsFactory','currenciesFactory',
        function ($scope, $routeParams, $location, projectsFactory, currenciesFactory) {
            var project = projectsFactory.getProject($routeParams.projectName);
            $scope.currencies = currenciesFactory.getAll();
            var transac = getTransaction(project,$routeParams.transactionId);

            $scope.projectName = project.name;
            $scope.members = project.members;

            $scope.selectedCreditor = transac.from;
            $scope.selectedDebtors = transac.to.slice(0);
            $scope.amount = transac.amount;
            $scope.comment = transac.comment;
            $scope.selectedCurrency = transac.currency;

            $scope.addCurrency = function(currency) {
                if($scope.currencies.indexOf(currency) == -1) {
                    currenciesFactory.add(currency);
                }
                $scope.selectedCurrency = currency;
            }
            $scope.addTransaction = function() {
                if(isNaN($scope.amount)){
                    return true;
                }
                transac.from = $scope.selectedCreditor;
                transac.to = $scope.selectedDebtors.slice(0);
                transac.comment = $scope.comment;
                transac.currency = $scope.selectedCurrency;
                transac.amount = parseFloat($scope.amount);
                transac.HasBeenUpdated();
                if($routeParams.transactionId == 0/*mean a new transaction*/) {
                    project.transactions.push(transac);
                }
                projectsFactory.saveProject(project);
                $location.path('/project/'+$scope.projectName+"/2").replace();
                return false;
            };

            function getTransaction(project, transactionId){
                var orderedResults = Enumerable.from<Transaction>(project.transactions);
                var existing = orderedResults.where(
                    function (o) {return o.id == transactionId}
                ).firstOrDefault();
                var result = existing;

                function getDefaultCurrency() {
                    var result = $scope.currencies[0];
                    if(orderedResults.count() != 0){
                        result = orderedResults.last().currency;
                    }
                    return result;
                }

                if(existing == null) {
                    result = new Transaction();
                    result.from = project.members[0];
                    result.to = project.members.slice(0);
                    result.currency = getDefaultCurrency();
                    result.comment =  "";
                }
                return result;
            }
        }]);