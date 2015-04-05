///<reference path="../linq/linq.d.ts"/>
///<reference path="../angular.d.ts"/>
///<reference path="../Project.ts"/>
///<reference path="../Transaction.ts"/>
///<reference path="../Balance.ts"/>
///<reference path="../SettlementEntry.ts"/>
angular.module('splitonsApp').controller(
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

            $scope.settleDebts = function(debtor, creditor, amount) {
                var t = new Transaction(debtor,[creditor], "settlement transaction", amount);
                $scope.transactions.push(t);
                projectsFactory.saveProject(p);
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
                        result[debitor].amount -= (Math.round((t.amount / numberOfDebiter)* 100) / 100);
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