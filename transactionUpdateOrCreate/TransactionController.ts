///<reference path="../linq/linq.d.ts"/>
///<reference path="../external/angular.d.ts"/>
///<reference path="../dataObjects/Project.ts"/>
///<reference path="../dataObjects/Transaction.ts"/>
///<reference path="../Balance.ts"/>
///<reference path="../SettlementEntry.ts"/>
angular.module('splitonsApp').controller(
    'TransactionController', ['$scope', '$routeParams', '$location', 'projectsFactory','currenciesFactory',
        function ($scope, $routeParams, $location, projectsFactory, currenciesFactory) {
            var project = projectsFactory.getProject($routeParams.projectId);
            $scope.currencies = currenciesFactory.getAll();
            var transac = getTransaction(project,$routeParams.transactionId);

            $scope.projectName = project.name;
            $scope.members = project.members;

            $scope.selectedCreditor = transac.from;
            $scope.selectedDebtors = transac.to.slice(0);
            $scope.amount = transac.amount;
            $scope.comment = transac.comment;

            //START Currencies
            $scope.selectedCurrency = transac.currency;

            $scope.addCurrency = function() {
                var currency = $scope.newCurrency;
                if($scope.currencies.indexOf(currency) == -1) {
                    currenciesFactory.add(currency);
                }
                $scope.selectedCurrency = currency;
            }

            $scope.deleteCurrency = function (currency) {
                var index = $scope.currencies.indexOf(currency);
                if(index == -1) {
                    return;
                }
                currenciesFactory.delete(currency);
            }
            //END Currencies
            $scope.addTransaction = function() {
                if(isNaN($scope.amount)){
                    return true;
                }
                transac.from = $scope.selectedCreditor;
                transac.to = $scope.selectedDebtors.slice(0);
                transac.comment = $scope.comment;
                transac.currency = $scope.selectedCurrency;
                transac.amount = parseFloat($scope.amount);
                if($routeParams.transactionId == 0/*mean a new transaction*/) {
                    project.transactions.push(transac);
                }
                else{
                    transac.HasBeenUpdated();
                }
                projectsFactory.saveProject(project);
                $scope.back();
                return false;
            };

            function getTransaction(project, transactionId){
                //We try to get the existing transaction
                var orderedResults = Enumerable.from<Transaction>(project.transactions);
                var existing = orderedResults.where(
                    function (o) {return o.id == transactionId}
                ).firstOrDefault();
                var result = existing;

                //Else we create a new one
                if(existing == null) {
                    function getDefaultCurrency() {
                        var result = $scope.currencies[0];
                        if(orderedResults.count() != 0){
                            result = orderedResults.last().currency;
                        }
                        return result;
                    }
                    result = new Transaction();
                    result.from = project.members[0];
                    result.to = project.members.slice(0);
                    result.currency = getDefaultCurrency();
                    result.comment =  "";
                }

                //This prevent a bug if the currency has been removed
                if($scope.currencies.indexOf(result.currency) == -1){
                    $scope.currencies.push(result.currency);
                }
                return result;
            }

            $scope.back = function() {
                window.history.back();
            };
        }]);