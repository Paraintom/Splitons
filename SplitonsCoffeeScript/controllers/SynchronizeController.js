///<reference path="../linq/linq.d.ts"/>
///<reference path="../angular.d.ts"/>
///<reference path="../dataObjects/Project.ts"/>
///<reference path="../dataObjects/Transaction.ts"/>
///<reference path="../Balance.ts"/>
///<reference path="../SettlementEntry.ts"/>
///<reference path="../RequestFlicker/LiteEvent.ts"/>
///<reference path="../RequestFlicker/ServiceLookup.ts"/>
///<reference path="../RequestFlicker/RequestFlicker.ts"/>
angular.module('splitonsApp').controller('SynchronizeController', ['$scope', '$routeParams', 'projectsFactory', 'synchFactory', 'notify', '$timeout', '$route', function ($scope, $routeParams, projectsFactory, synchFactory, notify, $timeout, $route) {
    var p = projectsFactory.getProject($routeParams.projectId);
    $scope.projectName = p.name;
    $scope.lastUpdated = p.lastUpdated;
    $scope.synchronizing = false;
    var synchronizer = synchFactory.get();
    synchronizer.onSynchronized().subscribe(handleResult);
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
}]);
//# sourceMappingURL=SynchronizeController.js.map