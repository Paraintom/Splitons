/// <reference path="../LiteEvent.ts" />
/// <reference path="../linq/linq.d.ts"/>
/// <reference path="../RequestFlicker/ServiceLookup.ts" />
/// <reference path="../RequestFlicker/RequestFlicker.ts" />
/// <reference path="../RequestFlicker/ISynchronizer.ts" />
/// <reference path="../dataObjects/Project.ts" />
/// <reference path="IShareMechanism.ts"/>
///<reference path="FastFlickerClient.ts"/>
var ShareViaFastFlicker = (function () {
    function ShareViaFastFlicker() {
        this.onProjectReceivedEvent = new LiteEvent();
        this.onErrorEvent = new LiteEvent();
    }
    ShareViaFastFlicker.prototype.onProjectReceived = function () {
        return this.onProjectReceivedEvent;
    };
    ShareViaFastFlicker.prototype.onError = function () {
        return this.onErrorEvent;
    };
    ShareViaFastFlicker.prototype.share = function (projectId, projectName, passphrase) {
        var _this = this;
        if (navigator.onLine) {
            //after put : http://www.olivettom.com/hb/index.php
            var serviceLookup = new ServiceLookup("http://www.olivettom.com/hb/index.php");
            serviceLookup.onError().subscribe(function (a) { return _this.onLookupError(a); });
            var whenReadyMethod;
            serviceLookup.onResult().subscribe(function (ipAndPort) {
                whenReadyMethod = function (ff) { return _this.whenReadySharing(ff, projectId, projectName, ipAndPort, passphrase, 0); };
                _this.onLookupSuccess(ipAndPort, passphrase, whenReadyMethod);
            });
            serviceLookup.getService("FastFlicker");
        }
        else {
            this.onLookupError("Impossible to Share project in offline mode");
        }
    };
    //TODO factorize with share...
    ShareViaFastFlicker.prototype.receive = function (passphrase) {
        var _this = this;
        if (navigator.onLine) {
            //after put : http://www.olivettom.com/hb/index.php
            var serviceLookup = new ServiceLookup("http://www.olivettom.com/hb/index.php");
            serviceLookup.onError().subscribe(function (a) { return _this.onLookupError(a); });
            var whenReadyMethod;
            serviceLookup.onResult().subscribe(function (ipAndPort) {
                whenReadyMethod = function (ff) { return console.debug('Connection open for ' + passphrase); };
                _this.onLookupSuccess(ipAndPort, passphrase, whenReadyMethod);
            });
            serviceLookup.getService("FastFlicker");
        }
        else {
            this.onLookupError("Impossible to Share project in offline mode");
        }
    };
    //########## Lookup handling###########
    ShareViaFastFlicker.prototype.onLookupError = function (error) {
        var errorMessage = "Error from ServiceLookup : " + error;
        this.raiseError(errorMessage);
    };
    ShareViaFastFlicker.prototype.onLookupSuccess = function (ipAndPort, passphrase, onReadyLogic) {
        var _this = this;
        var successMessage = "ServiceLookup sucessfull, found [" + ipAndPort + "]";
        console.log(successMessage);
        this.fastFlicker = new FastFlickerClient(ipAndPort, passphrase);
        this.fastFlicker.onMessage().subscribe(function (a) { return _this.handleAnswer(a); });
        this.fastFlicker.onError().subscribe(function (a) { return _this.handleError(a); });
        this.fastFlicker.onReady().subscribe(function () {
            onReadyLogic(_this.fastFlicker);
        });
        this.fastFlicker.open();
    };
    ShareViaFastFlicker.prototype.whenReadySharing = function (fastFlicker, projectId, projectName, ipAndPort, passphrase, numberTry) {
        var _this = this;
        var toSend = new ShareResultEvent(projectId, projectName);
        fastFlicker.send(JSON.stringify(toSend));
        fastFlicker.close();
        if (numberTry != 3) {
            numberTry++;
            console.log("Trying again, numberOfTry " + numberTry);
            setTimeout(function () {
                var whenReadyMethod;
                whenReadyMethod = function (ff) { return _this.whenReadySharing(ff, projectId, projectName, ipAndPort, passphrase, numberTry); };
                _this.onLookupSuccess(ipAndPort, passphrase, whenReadyMethod);
            }, 5000);
        }
    };
    ShareViaFastFlicker.prototype.raiseError = function (error) {
        this.onErrorEvent.raise(error);
        console.log(error);
    };
    //########## Service handling ###########
    ShareViaFastFlicker.prototype.handleAnswer = function (answer) {
        console.log("Answer received");
        var json = JSON.parse(answer);
        if (Guid.isGuid(json.projectId)) {
            this.onProjectReceivedEvent.raise(new ShareResultEvent(json.projectId, json.projectName));
            this.fastFlicker.close();
            console.log("Connection closed...");
        }
        else {
            console.warn('the answer is not a Guid!');
        }
    };
    ShareViaFastFlicker.prototype.handleError = function (errorEvent) {
        var errorString = errorEvent;
        this.raiseError(errorString);
    };
    return ShareViaFastFlicker;
})();
//# sourceMappingURL=ShareViaFastFlicker.js.map