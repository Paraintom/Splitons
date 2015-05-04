/**
 * Created by Tom on 04/04/2015.
 */

///<reference path="../linq/linq.d.ts"/>
///<reference path="../angular.d.ts"/>
///<reference path="../dataObjects/Project.ts"/>
///<reference path="../dataObjects/Transaction.ts"/>


var currenciesFactory = angular.module('currenciesFactory', ['ngResource']);

currenciesFactory.factory('currenciesFactory', function () {

    var localStorageKey = "currencyList";
    var separator = "░";
    var allCurrencies = [];
    init();

    function init(){
        try {
            var currenciesListString = localStorage.getItem(localStorageKey);
            if(currenciesListString === null){
                allCurrencies = ["€", "£", "$", " "];
            }
            else{
                allCurrencies = currenciesListString.split(separator);
            }
        } catch (error) {
            this.$log.error("LocalStorageService::currenciesFactory::init: can't retrieve the list of currencies. Error: " + error);
        }
    }

    return {
        getAll: function () {
            return allCurrencies;
        }
        /* In the future, we should propose the possibility for the user to add his own currencies */
    }
});