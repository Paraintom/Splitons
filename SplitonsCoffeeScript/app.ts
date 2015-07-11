///<reference path="linq/linq.d.ts"/>
///<reference path="angular.d.ts"/>

var splitonsApp = angular.module('splitonsApp', ['ngRoute',
    'projectsFactory','currenciesFactory','synchFactory',
    'checklist-model', 'cgNotify']);

splitonsApp.config(['$routeProvider',
    function ($routeProvider) {
        $routeProvider.
            when('/', {
                templateUrl: 'partials/listProjects.html',
                controller: 'ListProjectsController'
            }).
            when('/project/:projectId/overview/:projectName?', {
                templateUrl: 'partials/overview.html',
                controller: 'OverviewController'
            }).
            when('/project/:projectId/:activeTab', {
                templateUrl: 'partials/basic.html',
                controller: 'ProjectController'
            }).
            when('/project/:projectId/:transactionId/transaction', {
                templateUrl: 'partials/transaction.html',
                controller: 'TransactionController'
            }).
            otherwise({
                redirectTo: '/'
            });
    }]);
