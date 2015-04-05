///<reference path="linq/linq.d.ts"/>
///<reference path="angular.d.ts"/>

var splitonsApp = angular.module('splitonsApp', ['ngRoute', 'projectsFactory','checklist-model']);

splitonsApp.config(['$routeProvider',
    function ($routeProvider) {
        $routeProvider.
            when('/', {
                templateUrl: 'partials/listProjects.html',
                controller: 'ListProjectsController'
            }).
            when('/project/:projectName/:activeTab', {
                templateUrl: 'partials/basic.html',
                controller: 'ProjectController'
            }).
            when('/project/:projectName/:transactionId/transaction', {
                templateUrl: 'partials/transaction.html',
                controller: 'TransactionController'
            }).
            otherwise({
                redirectTo: '/'
            });
    }]);
