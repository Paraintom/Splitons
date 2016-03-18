///<reference path="../external/linq.d.ts"/>
///<reference path="../external/bootbox.d.ts"/>
///<reference path="../external/angular.d.ts"/>
///<reference path="../dataObjects/Project.ts"/>
///<reference path="../dataObjects/Transaction.ts"/>
var addWaveEffect = function () {
    $(".rippleBtn").click(function (e) {
        // Remove any old one
        $(".ripple").remove();

        // Setup
        var posX = $(this).offset().left,
            posY = $(this).offset().top,
            buttonWidth = $(this).width(),
            buttonHeight = $(this).height();

        // Add the element
        $(this).prepend("<span class='ripple'></span>");


        // Make it round!
        if (buttonWidth >= buttonHeight) {
            buttonHeight = buttonWidth;
        } else {
            buttonWidth = buttonHeight;
        }

        // Get the center of the element
        var x = e.pageX - posX - buttonWidth / 2;
        var y = e.pageY - posY - buttonHeight / 2;


        // Add the ripples CSS and start the animation
        $(".ripple").css({
            width: buttonWidth,
            height: buttonHeight,
        }).addClass("rippleEffect");
    });
};
angular.module('splitonsApp').controller(
    'ListGroupsController', ['$scope', 'projectsFactory', 'synchFactory', '$location', '$route', '$window',
        function ($scope, projectsFactory, synchFactory, $location, $route, $window) {

            $scope.projects = projectsFactory.getAllProject();

            $scope.createProject = function () {
                bootbox.prompt({
                    title: 'Create a Group',
                    placeholder: 'Enter group name...',
                    callback: function (result) {
                        if (result !== null) {
                            $scope.$apply(function() {
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

            $scope.sendViaFastFlicker = function (projectName,projectId) {
                var passphrase :string;
                passphrase =  projectId.substring(0,4);
                var sharer = synchFactory.getSharer();
                sharer.onError().subscribe((err) => console.log("Sharer error : "+err));

                bootbox.dialog({
                    message:"Share the following code with your friends : <b>"+ passphrase + "</b><br>" +
                    "When he is listening, click on Button <b>Share</b>." +
                    "<script>addWaveEffect()</script>",
                    title: 'Share a Group',
                    buttons: {
                        cancel: {
                            label: "Exit",
                            callback: function() {
                                //Close the modal.
                            }
                        },
                        main: {
                            label: "Share",
                            className: "btn-primary rippleBtn",
                            callback: function (result) {
                                sharer.share(projectId, projectName, passphrase);
                                return false;
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

            $scope.receiveProject = function () {
                bootbox.dialog({
                    message:
                    '<div id="joinGroupCode">' +
                    '<input class="bootbox-input bootbox-input-text form-control" autocomplete="off" type="text" placeholder="Enter group code...">' +
                    '</div>',
                    title: 'Join a Group',
                    buttons: {
                        cancel: {
                            label: "Cancel",
                            callback: function() {
                                //do something
                            }
                        },
                        main: {
                            label: "<span id='joinGroupMainLabel'>Start Listening</span>",
                            className: "btn-primary",
                            callback: function (result) {
                                var code = $('#joinGroupCode input').val();
                                //console.debug('code= '+code);
                                if (code.length == 4) {
                                    //
                                    setInterval (addDot, 600);
                                    var sharer = synchFactory.getSharer();
                                    sharer.onProjectReceived().subscribe(
                                        (a) => {
                                            console.debug('received ' + a.projectName);
                                            $scope.$apply(function () {
                                                //sweet!
                                                bootbox.hideAll();
                                                $location.path('project/' + a.projectId + '/overview/' + a.projectName).replace();
                                            });
                                        }
                                    );
                                    sharer.receive(code);
                                    $('#joinGroupCode').html('Waiting for an answer for '+code+' <span id="dots"></span>');
                                    $('#joinGroupMainLabel').html('Listening');
                                    console.info('Receiving project with passphrase : ' + code);
                                    return false;
                                }
                            }
                        }
                    }
                });
            }
        }]);

// Here it is just Loadingdotdotdot!
var dots = 0;
function addDot()
{
    if(dots < 3)
    {
        $('#dots').append('.');
        dots++;
    }
    else
    {
        $('#dots').html('');
        dots = 0;
    }
}