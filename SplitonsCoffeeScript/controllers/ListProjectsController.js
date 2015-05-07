///<reference path="../linq/linq.d.ts"/>
///<reference path="../angular.d.ts"/>
///<reference path="../dataObjects/Project.ts"/>
///<reference path="../dataObjects/Transaction.ts"/>
///<reference path="../Balance.ts"/>
///<reference path="../SettlementEntry.ts"/>
angular.module('splitonsApp').controller('ListProjectsController', ['$scope', 'projectsFactory', '$location', '$route', function ($scope, projectsFactory, $location, $route) {
    $scope.projects = projectsFactory.getAllProject();
    $scope.createProject = function () {
        if ($scope.newProjectName) {
            var newProject = projectsFactory.getNewProject($scope.newProjectName);
            $location.path('/project/' + $scope.newProjectName + "/1").replace();
        }
    };
    $scope.deleteProject = function (projectId) {
        for (var index in $scope.projects) {
            if ($scope.projects[index].id == projectId) {
                $scope.projects.splice(index, 1);
                projectsFactory.deleteProject(projectId);
            }
        }
    };
}]);
//# sourceMappingURL=ListProjectsController.js.map