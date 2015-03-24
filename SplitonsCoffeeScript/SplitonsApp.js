///<reference path="linq/linq.d.ts"/>
///<reference path="angular.d.ts"/>
///<reference path="Project.ts"/>
///<reference path="Transaction.ts"/>
///<reference path="Balance.ts"/>
///<reference path="SettlementEntry.ts"/>
var splitonsApp = angular.module('splitonsApp', ['ngRoute', 'projectsFactory', 'checklist-model']);
splitonsApp.controller('FakeDataController', ['$scope', '$routeParams', 'projectsFactory', function ($scope, $routeParams, projectsFactory) {
    var p = projectsFactory.getProject($routeParams.projectName);
    $scope.projectName = p.name;
    $scope.transactions = p.transactions;
    $scope.members = p.members;
    $scope.balances = calculateBalances();
    $scope.settlements = calculateSettlement();
    $scope.addMember = function () {
        if (p.members.indexOf($scope.newMember) == -1) {
            p.members.push($scope.newMember);
            projectsFactory.saveProject(p);
        }
    };
    function calculateBalances() {
        var result = {};
        //Initialisation
        p.members.forEach(function (m) { return result[m] = new Balance(m, 0); });
        //Computation
        p.transactions.forEach(function (t) {
            result[t.from].amount += t.amount;
            var numberOfDebiter = t.to.length;
            t.to.forEach(function (debitor) {
                result[debitor].amount -= (t.amount / numberOfDebiter);
            });
        });
        return result;
    }
    function calculateSettlement() {
        var result;
        result = [];
        var currentBalance = calculateBalances();
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
            result.push(new SettlementEntry(from, to, amount));
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
splitonsApp.controller('ListProjectsController', ['$scope', 'projectsFactory', function ($scope, projectsFactory) {
    $scope.projectNames = Enumerable.from(projectsFactory.getAllProject()).select(function (x) {
        return x.name;
    }).toArray();
}]);
splitonsApp.controller('AddTransactionController', ['$scope', '$routeParams', '$location', 'projectsFactory', function ($scope, $routeParams, $location, projectsFactory) {
    var p = projectsFactory.getProject($routeParams.projectName);
    $scope.projectName = p.name;
    $scope.members = p.members;
    $scope.selectedCreditor = $scope.members[0];
    $scope.selectedDebtors = $scope.members.slice(0);
    $scope.addTransaction = function () {
        p.transactions.push(new Transaction($scope.selectedCreditor, $scope.selectedDebtors, $scope.transactionSummary, parseFloat($scope.amount)));
        projectsFactory.saveProject(p);
        $location.path('/project/' + $scope.projectName).replace();
    };
}]);
splitonsApp.controller('CreateProjectController', ['$scope', '$location', 'projectsFactory', function ($scope, $location, projectsFactory) {
    $scope.createProject = function () {
        var newProject = projectsFactory.getNewProject($scope.newProjectName);
        $location.path('/project/' + $scope.newProjectName).replace();
    };
}]);
splitonsApp.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/listProjects', {
        templateUrl: 'partials/listProjects.html',
        controller: 'ListProjectsController'
    }).when('/newProject', {
        templateUrl: 'partials/newProject.html',
        controller: 'CreateProjectController'
    }).when('/project/:projectName', {
        templateUrl: 'partials/basic.html',
        controller: 'FakeDataController'
    }).when('/project/:projectName/addTransaction', {
        templateUrl: 'partials/addTransaction.html',
        controller: 'AddTransactionController'
    }).otherwise({
        redirectTo: '/listProjects'
    });
}]);
//# sourceMappingURL=SplitonsApp.js.map