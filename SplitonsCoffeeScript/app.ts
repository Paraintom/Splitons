///<reference path="angular.d.ts"/>

console.log(5454);
// Create a new module
var myModule = angular.module('splitonsApp2', ['ngRoute']);

// configure existing services inside initialization blocks.
myModule.config(['$routeProvider', function($routeProvider) {
    console.log(9999);
    $routeProvider
        .when('/overview',
        {
            controller: 'OverviewController',
            templateUrl: 'partials/Overview.html'
        })
        .when('/settlement',
        {
            controller: 'SettlementController',
            templateUrl: 'partials/Settlement.html'
        })
        .when('/expenses',
        {
            controller: 'ExpensesController',
            templateUrl: 'partials/Expenses.html'
        })
        .otherwise({redirectTo: '/overview'});
}]);
