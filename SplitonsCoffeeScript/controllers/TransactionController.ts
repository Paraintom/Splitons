///<reference path="../linq/linq.d.ts"/>
///<reference path="../angular.d.ts"/>
///<reference path="../dataObjects/Project.ts"/>
///<reference path="../dataObjects/Transaction.ts"/>
///<reference path="../Balance.ts"/>
///<reference path="../SettlementEntry.ts"/>
angular.module('splitonsApp').controller(
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
                if(existing == null) {
                    result = new Transaction();
                    result.from = project.members[0];
                    result.to = project.members.slice(0);
                    result.comment =  "";
                }
                return result;
            }
        }]);