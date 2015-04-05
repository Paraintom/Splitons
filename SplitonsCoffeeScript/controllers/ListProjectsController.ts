///<reference path="../linq/linq.d.ts"/>
///<reference path="../angular.d.ts"/>
///<reference path="../Project.ts"/>
///<reference path="../Transaction.ts"/>
///<reference path="../Balance.ts"/>
///<reference path="../SettlementEntry.ts"/>
angular.module('splitonsApp').controller(
    'ListProjectsController', ['$scope', 'projectsFactory', '$location',
        function ($scope, projectsFactory, $location) {
            $scope.projectNames =  Enumerable.from<Project>(projectsFactory.getAllProject()).select(function (x) {
                return x.name;
            }).toArray();

            $scope.createProject = function() {
                var newProject = projectsFactory.getNewProject($scope.newProjectName);
                $location.path('/project/'+$scope.newProjectName+"/1").replace();
            }
        }]);