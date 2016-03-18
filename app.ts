///<reference path="linq/linq.d.ts"/>
///<reference path="angular.d.ts"/>

var splitonsApp = angular.module('splitonsApp', ['ngRoute',
    'projectsFactory','currenciesFactory','synchFactory',
    'checklist-model', 'cgNotify']);

splitonsApp.config(['$routeProvider',
    function ($routeProvider) {
        $routeProvider.
            when('/', {
                templateUrl: 'listGroups/listGroups.html',
                controller: 'ListGroupsController'
            }).
            when('/project/:projectId/overview/:projectName?', {
                templateUrl: 'groupBalances/balances.html',
                controller: 'BalancesController'
            }).
            when('/project/:projectId/:activeTab', {
                templateUrl: 'listTransactions/listTransactions.html',
                controller: 'ListTransactionsController'
            }).
            when('/project/:projectId/:transactionId/transaction', {
                templateUrl: 'partials/transaction.html',
                controller: 'TransactionController'
            }).
            otherwise({
                redirectTo: '/'
            });
    }]);
