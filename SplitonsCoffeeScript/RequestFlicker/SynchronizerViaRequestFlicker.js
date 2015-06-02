/// <reference path="LiteEvent.ts" />
/// <reference path="../linq/linq.d.ts"/>
/// <reference path="ServiceLookup.ts" />
/// <reference path="RequestFlicker.ts" />
/// <reference path="ISynchronizer.ts" />
/// <reference path="../dataObjects/Project.ts" />
var SynchronizerViaRequestFlicker = (function () {
    function SynchronizerViaRequestFlicker() {
        this.onSynchronizationResultEvent = new LiteEvent();
    }
    SynchronizerViaRequestFlicker.prototype.onSynchronized = function () {
        return this.onSynchronizationResultEvent;
    };
    SynchronizerViaRequestFlicker.prototype.synchronize = function (project) {
        var _this = this;
        //after put : http://www.olivettom.com/hb/index.php
        var serviceLookup = new ServiceLookup("http://www.olivettom.com/hb/index.php");
        serviceLookup.onError().subscribe(function (a) { return _this.onLookupError(a); });
        serviceLookup.onResult().subscribe(function (ipAndPort) { return _this.onLookupSuccess(ipAndPort, project); });
        serviceLookup.getService("RequestFlicker");
    };
    //########## Lookup handling###########
    SynchronizerViaRequestFlicker.prototype.onLookupError = function (error) {
        var errorMessage = "Error from ServiceLookup:" + error;
        this.onSynchronizationResultEvent.raise(new SyncResultEvent(false, errorMessage));
        console.log(errorMessage);
    };
    SynchronizerViaRequestFlicker.prototype.onLookupSuccess = function (ipAndPort, project) {
        var _this = this;
        var successMessage = "ServiceLookup sucessfull, found [" + ipAndPort + "]";
        console.log(successMessage);
        var requestFlicker = new RequestFlickerClient(ipAndPort);
        requestFlicker.onAnswer().subscribe(function (a) { return _this.handleAnswer(a, project); });
        requestFlicker.onConnected().subscribe(function () { return console.log("Connected"); });
        requestFlicker.onDisconnected().subscribe(function () { return console.log("Disconnected"); });
        requestFlicker.onError().subscribe(function (a) { return _this.handleError(a); });
        var request = { "projectId": project.id, "lastUpdated": project.lastUpdated, "toUpdate": this.getToUpdate(project) };
        requestFlicker.request("SplitonSync", request);
    };
    //########## Service handling ###########
    SynchronizerViaRequestFlicker.prototype.handleAnswer = function (answer, p) {
        console.log("Answer received");
        //alert("received " + answer);
        var json = JSON.parse(answer);
        if (json.projectId != p.id) {
            alert("We received an answer with incorrect projectId " + answer.projectId);
        }
        var membersInvolved = [];
        for (var indexTransactionToUpdate in json.toUpdate) {
            var newTransaction = new Transaction().deserialize(json.toUpdate[indexTransactionToUpdate]);
            var transactionIndex = p.transactions.map(function (e) {
                return e.id;
            }).indexOf(newTransaction.id);
            if (transactionIndex != -1) {
                p.transactions.splice(transactionIndex, 1);
            }
            p.transactions.push(newTransaction);
            //alert('New transaction '+JSON.stringify(newTransaction));
            //We need to synchronize the members from to and from members
            if (p.members.indexOf(newTransaction.from) == -1) {
                p.members.push(newTransaction.from);
            }
            for (var indexPotential in newTransaction.to) {
                var potentialNewMember = newTransaction.to[indexPotential];
                if (p.members.indexOf(potentialNewMember) == -1) {
                    p.members.push(potentialNewMember);
                }
            }
        }
        p.lastUpdated = json.lastUpdated;
        this.onSynchronizationResultEvent.raise(new SyncResultEvent(true, "Done"));
    };
    SynchronizerViaRequestFlicker.prototype.handleError = function (errorEvent) {
        var errorString = errorEvent.message;
        if (errorString === undefined) {
            errorString = "This case happens when the websocket server reject our connection so far.";
        }
        //console.log("Synchronizer error : " + errorString);
        this.onSynchronizationResultEvent.raise(new SyncResultEvent(false, errorString));
    };
    SynchronizerViaRequestFlicker.prototype.getToUpdate = function (p) {
        return Enumerable.from(p.transactions).where(function (y) {
            var result = y.lastUpdated >= p.lastUpdated;
            return result;
        }).toArray();
    };
    return SynchronizerViaRequestFlicker;
})();
//# sourceMappingURL=SynchronizerViaRequestFlicker.js.map