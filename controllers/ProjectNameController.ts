///<reference path="../external/angular.d.ts"/>

angular.module('splitonsApp').controller(
    'ProjectNameController', ['$scope', '$project', 'projectsFactory', function ($scope, $project, projectsFactory) {
        $scope.projectName = $project.name;
        $scope.projectId = $project.id;
        $scope.newProjectName = "";

        $scope.renameProject = function () {
            if (!$scope.newProjectName) {
                alert('Empty project name, ignoring the update.');
            }
            else {

                $project.name = $scope.projectName = $scope.newProjectName;
                projectsFactory.saveProject($project);
            }
        }
    }]);