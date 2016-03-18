///<reference path="../external/linq.d.ts"/>
///<reference path="../external/angular.d.ts"/>
///<reference path="../dataObjects/Project.ts"/>
///<reference path="../dataObjects/Transaction.ts"/>
///<reference path="../RequestFlicker/ISynchronizer.ts"/>
///<reference path="../RequestFlicker/SynchronizerViaRequestFlicker.ts"/>
///<reference path="../FastFlicker/ShareViaFastFlicker.ts"/>

var synchFactory = angular.module('synchFactory', ['ngResource']);

synchFactory.factory('synchFactory', function () {

    var synchronizer  = new SynchronizerViaRequestFlicker();
    var sharer  = new ShareViaFastFlicker();

    return {
        get: function () {
            return synchronizer;
        },
        getSharer: function () {
            return sharer;
        }
    }
});
