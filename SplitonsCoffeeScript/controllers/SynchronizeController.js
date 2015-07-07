///<reference path="../linq/linq.d.ts"/>
///<reference path="../angular.d.ts"/>
///<reference path="../dataObjects/Project.ts"/>
///<reference path="../dataObjects/Transaction.ts"/>
///<reference path="../Balance.ts"/>
///<reference path="../SettlementEntry.ts"/>
///<reference path="../LiteEvent.ts"/>
///<reference path="../RequestFlicker/ServiceLookup.ts"/>
///<reference path="../RequestFlicker/RequestFlicker.ts"/>
///<reference path="../external/bootbox.d.ts"/>
angular.module('splitonsApp').controller('SynchronizeController', ['$scope', '$routeParams', 'projectsFactory', 'synchFactory', 'notify', '$timeout', '$location', '$window', '$controller', function ($scope, $routeParams, projectsFactory, synchFactory, notify, $timeout, $location, $window, $controller) {
    var p = projectsFactory.getProject($routeParams.projectId, $routeParams.projectName);
    //We inherit from the parent (Refactoring)
    $controller('ProjectNameController', { $scope: $scope, $project: p });
    $scope.projectId = p.id;
    $scope.projectName = p.name;
    $scope.lastUpdated = p.lastUpdated;
    $scope.synchronizing = false;
    var synchronizer = synchFactory.get();
    synchronizer.onSynchronized().subscribe(handleResult);
    //Now it is automatic on controller load.
    $scope.synchronize = function () {
        $scope.errorString = "";
        $scope.synchronizing = true;
        $timeout(function () {
            if ($scope.synchronizing) {
                handleResult({ success: false, message: 'Synchronisation timeout.' });
            }
        }, 5000);
        synchronizer.synchronize(p);
    };
    //We synchronize on load
    $scope.synchronize();
    $scope.$on('$destroy', function iVeBeenDismissed() {
        synchronizer.onSynchronized().unsubscribe(handleResult);
    });
    function handleResult(result) {
        //console.log("SynchControler handling result : "+result.success+ " "+result.message);
        var classe = result.success ? 'alert-success' : 'alert-danger';
        notify({ message: result.message, duration: 5000, classes: classe });
        $scope.synchronizing = false;
        $scope.lastUpdated = p.lastUpdated;
        if (result.success) {
            projectsFactory.saveProject(p);
        }
        (!$scope.$$phase);
        $scope.$apply();
    }
    $scope.sendViaEmail = function () {
        bootbox.prompt({
            title: "Enter here the mail of your friend",
            value: "yourFriendMail@domain.com",
            size: 'small',
            callback: function (result) {
                if (result) {
                    var link = "mailto:" + result + "?subject=New%20email" + encodeURIComponent("Splitons : Project " + $scope.projectName) + "&body=" + encodeURIComponent("Find here a link to the project : " + $location.absUrl());
                    console.log(link);
                    $window.open(link, '_blank');
                }
            }
        });
    };
    $scope.sendViaFastFlicker = function () {
        var passphrase;
        passphrase = this.projectId.substring(0, 4);
        var sharer = synchFactory.getSharer();
        sharer.onError().subscribe(function (err) { return handleResult({ success: false, message: 'Sharing error : ' + err }); });
        sharer.share(this.projectId, this.projectName, passphrase);
        bootbox.alert({
            title: "Sending project ...",
            message: "Share wih your friend the following passphrase : " + passphrase,
            size: 'small'
        });
    };
}]);
//# sourceMappingURL=SynchronizeController.js.map