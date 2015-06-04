///<reference path="../linq/linq.d.ts"/>
///<reference path="../angular.d.ts"/>
///<reference path="../dataObjects/Project.ts"/>
///<reference path="../dataObjects/Transaction.ts"/>
///<reference path="../RequestFlicker/ISynchronizer.ts"/>
///<reference path="../RequestFlicker/SynchronizerViaRequestFlicker.ts"/>
var synchFactory = angular.module('synchFactory', ['ngResource']);
synchFactory.factory('synchFactory', function () {
    var toProvide = new SynchronizerViaRequestFlicker();
    return {
        get: function () {
            return toProvide;
        }
    };
});
//# sourceMappingURL=synchFactory.js.map