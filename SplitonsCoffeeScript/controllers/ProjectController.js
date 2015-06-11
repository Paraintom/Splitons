///<reference path="../linq/linq.d.ts"/>
///<reference path="../angular.d.ts"/>
///<reference path="../dataObjects/Project.ts"/>
///<reference path="../dataObjects/Transaction.ts"/>
///<reference path="../Balance.ts"/>
///<reference path="../SettlementEntry.ts"/>
///<reference path="../external/bootbox.d.ts"/>
angular.module('splitonsApp').controller('ProjectController', ['$scope', '$routeParams', 'projectsFactory', '$route', '$filter', '$controller', function ($scope, $routeParams, projectsFactory, $route, $filter, $controller) {
    $scope.activeTab = $routeParams.activeTab;
    var p = projectsFactory.getProject($routeParams.projectId);
    //We inherit from the parent (Refactoring)
    $controller('ProjectNameController', { $scope: $scope, $project: p });
    $scope.projectId = p.id;
    $scope.transactions = p.transactions;
    $scope.notDeletedTransactions = $filter('filter')(p.transactions, { deleted: false });
    $scope.members = p.members;
    $scope.allCurrencies = calculateAllCurrencies();
    $('#newMemberTextBox').focus();
    $scope.setSelectedCurrency = function (currency) {
        $scope.selectedCurrency = currency;
        $scope.balances = calculateBalances(currency);
        $scope.settlements = calculateSettlement(currency);
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
    var toDelete;
    $scope.deleteTransaction = function (id) {
        for (var index in $scope.transactions) {
            var currentTransaction = $scope.transactions[index];
            if (currentTransaction.id == id) {
                toDelete = currentTransaction;
                bootbox.confirm({
                    size: 'small',
                    message: "Are you sure you want to delete the transaction " + toDelete.comment + "?",
                    callback: function (result) {
                        if (result) {
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
    };
    $scope.settleDebts = function (debtor, creditor, amount, currency) {
        var t = new Transaction();
        t.from = debtor;
        t.to = [creditor];
        t.comment = "settlement transaction";
        t.amount = amount;
        t.currency = currency;
        t.HasBeenUpdated();
        $scope.transactions.push(t);
        projectsFactory.saveProject(p);
        $route.reload();
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
    function calculateSettlement(currency) {
        var result;
        result = [];
        var currentBalance = calculateBalances(currency);
        while (notFinished(currentBalance)) {
            if (bug(currentBalance)) {
                throw new Error("Bug in calculateSettlement, the balance was not balanced!" + currentBalance);
            }
            var orderedResults = Enumerable.from(currentBalance).select(function (x) {
                return x.value;
            }).where(function (x) {
                return x.amount != 0;
            }).orderBy(function (x) {
                return x.amount;
            });
            var biggestDebtor = orderedResults.first();
            var biggestCreditor = orderedResults.last();
            var to = biggestCreditor.member;
            var from = biggestDebtor.member;
            var amount = Math.min(Math.abs(biggestCreditor.amount), Math.abs(biggestDebtor.amount));
            biggestCreditor.amount -= amount;
            biggestDebtor.amount += amount;
            result.push(new SettlementEntry(from, to, amount, currency));
        }
        //result.forEach(o=>console.debug("from:"+o.from+" to:"+o.to+" amount:"+o.amount));
        return result;
    }
    function notFinished(currentBalance) {
        return Enumerable.from(currentBalance).count(function (x) {
            return x.value.amount != 0;
        }) > 1;
    }
    function bug(currentBalance) {
        var allPositive = Enumerable.from(currentBalance).all(function (x) {
            return x.value.amount >= 0;
        });
        var allNegative = Enumerable.from(currentBalance).all(function (x) {
            return x.value.amount <= 0;
        });
        return allPositive || allNegative;
    }
}]);
//# sourceMappingURL=ProjectController.js.map