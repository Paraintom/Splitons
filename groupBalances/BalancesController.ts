///<reference path="../external/linq.d.ts"/>
///<reference path="../external/angular.d.ts"/>
///<reference path="../dataObjects/Project.ts"/>
///<reference path="../dataObjects/Transaction.ts"/>
///<reference path="Balance.ts"/>
///<reference path="SettlementEntry.ts"/>
///<reference path="../external/bootbox.d.ts"/>

angular.module('splitonsApp').controller(
    'BalancesController', ['$scope', '$routeParams', 'projectsFactory', '$route','$filter','$controller',
        function ($scope, $routeParams, projectsFactory, $route, $filter, $controller) {
            var p = projectsFactory.getProject($routeParams.projectId,$routeParams.projectName);
            //We inherit from the parent (Refactoring)
            $controller('SynchronizeController', {$scope: $scope, $project : p});
            $scope.activeTab =1;

            $scope.members = p.members;
            $scope.notDeletedTransactions = [];

            function setNotDeletedTransaction() {
                var allTransactions = Enumerable.from<Transaction>($scope.transactions);
                var result = allTransactions.where(function (x) {
                    return !x.deleted;
                });
                $scope.notDeletedTransactions =result;
            }

            $scope.transactions =  p.transactions;
            $scope.$watchCollection('transactions.length', function (newVal, oldVal) {
                setNotDeletedTransaction();
                $scope.allCurrencies = calculateAllCurrencies();
                $scope.setSelectedCurrency($scope.allCurrencies[0]);
            },true);

            $scope.setSelectedCurrency = function(currency) {
                $scope.selectedCurrency = currency;
                $scope.balances = calculateBalances(currency);
            }

            $scope.settleBalances = function () {
                var results = calculateSettlement($scope.selectedCurrency);
                var message ="<ul class=\"lead list-unstyled\">";
                for(var index in results){
                    var settlement = results[index];
                    message += "<li>";
                    message += "<span>"+settlement.from+" should pay "+settlement.to+
                        " <b>"+settlement.amount+"<\/b>"+settlement.currency+"<\/span>";
                    message += "<\/li>";
                }
                message += "<\/ul>";
                bootbox.alert({
                    size: 'large',
                    title: "How to settle balances",
                    message: message,
                    callback: function(){ }
                });
                //Settlement feature:
                function calculateSettlement(currency) {
                    var result:SettlementEntry[];
                    result = [];
                    var currentBalance = calculateBalances(currency);
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
                        result.push(new SettlementEntry(from, to, Number(amount.toFixed(2)), currency));
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
            }

            $scope.addMember = function () {
                bootbox.prompt({
                    title: 'Add a Member',
                    placeholder: 'Enter member name...',
                    callback: function (newMemberName) {
                        var getTransactionEmptyForNewMember = function () {
                            var emptyTransacForMemberSynch = new Transaction();
                            emptyTransacForMemberSynch.amount = 0;
                            emptyTransacForMemberSynch.comment = "New member " + newMemberName;
                            emptyTransacForMemberSynch.deleted = true;
                            emptyTransacForMemberSynch.currency = '';
                            emptyTransacForMemberSynch.from = newMemberName;
                            emptyTransacForMemberSynch.to = [];
                            emptyTransacForMemberSynch.to.push(newMemberName);
                            return emptyTransacForMemberSynch;
                        };
                        if (newMemberName !== null && $.trim(newMemberName) !== '') {
                            if (p.members.indexOf(newMemberName) == -1) {
                                p.members.push(newMemberName);
                                var emptyTransacForMemberSynch = getTransactionEmptyForNewMember();
                                //console.debug("adding empty transaction for new member (synch members feature)")
                                p.transactions.push(emptyTransacForMemberSynch);
                                projectsFactory.saveProject(p);
                            }
                            $route.reload();
                        }
                    }
                });
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
            $scope.getBalance = function(name) {
                var allBalances = Enumerable.from($scope.balances).select(function (x) {return x.value;});
                var ba = Enumerable.from<Balance>(allBalances).firstOrDefault(function (x) {
                    return x.member == name;
                });
                return ba.amount;
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

            function calculateBalances(forCurrency) {
                var result:{ [id: string] : Balance; } = {};
                //Initialisation
                p.members.forEach(m=>result[m] = new Balance(m, 0));
                //Computation
                $scope.notDeletedTransactions.forEach(t=> {
                    if(t.currency != forCurrency)
                        return;
                    //console.debug('considering '+t.comment + ' : '+t.amount);
                    result[t.from].amount += t.amount;
                    //console.debug('adding to '+t.from + ' : '+t.amount);
                    var numberOfDebiter = t.to.length;

                    t.to.forEach(debitor=> {
                        //console.debug('removing to '+debitor + ' : '+t.amount);
                        result[debitor].amount -= (Math.round((t.amount / numberOfDebiter) * 100) / 100);
                    });
                });
                return result;
            }
        }]);