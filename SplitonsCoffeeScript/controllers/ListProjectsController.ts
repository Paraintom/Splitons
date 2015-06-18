///<reference path="../linq/linq.d.ts"/>
///<reference path="../external/bootbox.d.ts"/>
///<reference path="../angular.d.ts"/>
///<reference path="../dataObjects/Project.ts"/>
///<reference path="../dataObjects/Transaction.ts"/>
///<reference path="../Balance.ts"/>
///<reference path="../SettlementEntry.ts"/>
angular.module('splitonsApp').controller(
    'ListProjectsController', ['$scope', 'projectsFactory', '$location', '$route', '$window',
        function ($scope, projectsFactory, $location, $route, $window) {

            $scope.projects = projectsFactory.getAllProject();

            $scope.createProject = function () {
                if ($scope.newProjectName) {
                    var newProject = projectsFactory.getNewProject($scope.newProjectName);
                    $location.path('/project/' + newProject.id + "/1").replace();
                }
            };

            $scope.deleteProject = function (projectName, projectId) {
                bootbox.confirm({
                    size: 'small',
                    message: "Are you sure you want to delete the project "+projectName+"?",
                    callback: function(result){
                        if(result){
                            for (var index in $scope.projects) {
                                if ($scope.projects[index].id == projectId) {
                                    $scope.projects.splice(index, 1);
                                    projectsFactory.deleteProject(projectId);
                                    $route.reload();
                                }
                            }
                        }
                    }
                });
            }

            $scope.sendFeedback = function () {
                var link = "mailto:" + "thomas.barles+SplitonsFeedback@gmail.com"
                    + "?subject=New%20email" + encodeURIComponent("Splitons feedback")
                    /*+ "&body=" + encodeURIComponent("Find here a link to the project : " + $location.absUrl())*/;

                console.log(link);
                $window.open(link, '_blank');
            }
        }]);