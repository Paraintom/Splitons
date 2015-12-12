///<reference path="../linq/linq.d.ts"/>
///<reference path="../external/bootbox.d.ts"/>
///<reference path="../angular.d.ts"/>
///<reference path="../dataObjects/Project.ts"/>
///<reference path="../dataObjects/Transaction.ts"/>
///<reference path="../Balance.ts"/>
///<reference path="../SettlementEntry.ts"/>
///<reference path="../external/bootbox.d.ts"/>
angular.module('splitonsApp').controller('ListProjectsController', ['$scope', 'projectsFactory', 'synchFactory', '$location', '$route', '$window', function ($scope, projectsFactory, synchFactory, $location, $route, $window) {
    $scope.projects = projectsFactory.getAllProject();
    $scope.createProject = function () {
        bootbox.prompt({
            title: 'Create a Group',
            placeholder: 'Enter group name...',
            callback: function (result) {
                if (result !== null) {
                    $scope.$apply(function () {
                        var newProject = projectsFactory.getNewProject(result);
                        $location.path('/project/' + newProject.id + "/overview").replace();
                    });
                }
            }
        });
    };
    $scope.deleteProject = function (projectName, projectId) {
        bootbox.confirm({
            size: 'small',
            title: 'Delete Group?',
            message: "Are you sure you want to delete the group: <b>" + projectName + " </b>?",
            callback: function (result) {
                if (result) {
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
    };
    $scope.sendViaFastFlicker = function (projectName, projectId) {
        var passphrase;
        passphrase = projectId.substring(0, 4);
        var sharer = synchFactory.getSharer();
        sharer.onError().subscribe(function (err) { return console.log("Sharer error : " + err); });
        sharer.share(projectId, projectName, passphrase);
        bootbox.alert({
            title: "Share Group",
            message: "Share the following code with your friends : <b>" + passphrase + "</b>",
            size: 'small'
        });
    };
    $scope.sendFeedback = function () {
        var link = "mailto:" + "thomas.barles+SplitonsFeedback@gmail.com" + "?subject=New%20email" + encodeURIComponent("Splitons feedback");
        console.log(link);
        $window.open(link, '_blank');
    };
    $scope.receiveProject = function () {
        bootbox.prompt({
            title: 'Join a Group',
            placeholder: 'Enter group code...',
            callback: function (result) {
                if (result !== null) {
                    var sharer = synchFactory.getSharer();
                    sharer.onProjectReceived().subscribe(function (a) {
                        console.debug('received ' + a.projectName);
                        $scope.$apply(function () {
                            $location.path('project/' + a.projectId + '/overview/' + a.projectName).replace();
                        });
                    });
                    sharer.receive(result);
                    console.info('Receiving project with passphrase : ' + result);
                }
            }
        });
    };
}]);
//# sourceMappingURL=ListProjectsController.js.map