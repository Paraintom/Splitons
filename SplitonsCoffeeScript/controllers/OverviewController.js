///<reference path="../linq/linq.d.ts"/>
///<reference path="../angular.d.ts"/>
///<reference path="../dataObjects/Project.ts"/>
///<reference path="../dataObjects/Transaction.ts"/>
///<reference path="../Balance.ts"/>
///<reference path="../SettlementEntry.ts"/>
///<reference path="../external/bootbox.d.ts"/>
angular.module('splitonsApp').controller('OverviewController', ['$scope', '$routeParams', 'projectsFactory', '$route', '$filter', '$controller', function ($scope, $routeParams, projectsFactory, $route, $filter, $controller) {
    var p = projectsFactory.getProject($routeParams.projectId);
    //We inherit from the parent (Refactoring)
    $controller('ProjectNameController', { $scope: $scope, $project: p });
    $scope.activeTab = 1;
    $scope.projectId = p.id;
    $scope.members = p.members;
    $scope.notDeletedTransactions = $filter('filter')(p.transactions, { deleted: false });
    $scope.allCurrencies = calculateAllCurrencies();
    $('#newMemberTextBox').focus();
    $scope.setSelectedCurrency = function (currency) {
        $scope.selectedCurrency = currency;
        $scope.balances = calculateBalances(currency);
        $scope.averagePerPerson = calculateAveragePerPerson();
    };
    $scope.setSelectedCurrency($scope.allCurrencies[0]);
    $scope.addMember = function () {
        if (p.members.indexOf($scope.newMember) == -1) {
            p.members.push($scope.newMember);
            projectsFactory.saveProject(p);
        }
        $route.reload();
    };
    $scope.deleteMember = function (name) {
        if (!$scope.existInTransactions(name)) {
            for (var index in $scope.members) {
                if ($scope.members[index] == name) {
                    $scope.members.splice(index, 1);
                    projectsFactory.saveProject(p);
                }
            }
            $route.reload();
        }
    };
    $scope.existInTransactions = function (name) {
        var allTransactions = Enumerable.from($scope.notDeletedTransactions);
        var inFrom = allTransactions.any(function (x) {
            return x.from == name;
        });
        var inTo = allTransactions.any(function (x) {
            return x.to.indexOf(name) > -1;
        });
        return inFrom || inTo;
    };
    $scope.getBalance = function (name) {
        var allBalances = Enumerable.from($scope.balances).select(function (x) {
            return x.value;
        });
        var ba = Enumerable.from(allBalances).firstOrDefault(function (x) {
            return x.member == name;
        });
        return ba.amount;
    };
    function calculateAveragePerPerson() {
        var result = 0;
        Enumerable.from($scope.notDeletedTransactions).where(function (y) {
            return y.currency == $scope.selectedCurrency;
        }).forEach(function (t) {
            result += t.amount;
        });
        var numberMembers = $scope.members.length;
        if (numberMembers != 0) {
            result = (result / numberMembers);
        }
        return result;
    }
    function calculateAllCurrencies() {
        var result = [];
        $scope.notDeletedTransactions.forEach(function (t) {
            var currentCurrency = t.currency;
            if (result.indexOf(currentCurrency) == -1) {
                result.push(currentCurrency);
            }
        });
        if (result.length == 0) {
            result.push("");
        }
        return result;
    }
    function calculateBalances(forCurrency) {
        var result = {};
        //Initialisation
        p.members.forEach(function (m) { return result[m] = new Balance(m, 0); });
        //Computation
        $scope.notDeletedTransactions.forEach(function (t) {
            if (t.currency != forCurrency)
                return;
            result[t.from].amount += t.amount;
            var numberOfDebiter = t.to.length;
            t.to.forEach(function (debitor) {
                result[debitor].amount -= (Math.round((t.amount / numberOfDebiter) * 100) / 100);
            });
        });
        return result;
    }
}]);
//# sourceMappingURL=OverviewController.js.map