/// <reference path="../dataObjects/LiteEvent.ts" />
/// <reference path="../external/linq.d.ts"/>
/// <reference path="ServiceLookup.ts" />
/// <reference path="RequestFlicker.ts" />
/// <reference path="ISynchronizer.ts" />
/// <reference path="../dataObjects/Project.ts" />
class SynchronizerViaRequestFlicker implements ISynchronizer {

    private onSynchronizationResultEvent = new LiteEvent<SyncResultEvent>();
    private lastSynchronized :{ [id: string] : number; } = {};

    onSynchronized():ILiteEvent<SyncResultEvent> {
        return this.onSynchronizationResultEvent;
    }

    shouldTryToSynchronize(project:Project) {
        var result = true;
        if(!navigator.onLine){
            result = false;
        }
        else {
            if (this.lastSynchronized[project.id]) {
                var now = new Date();
                result = (now.getTime() - this.lastSynchronized[project.id]) > 30 * 1000;
            }
        }
        return result;
    }

    synchronize(project:Project) {
        if(navigator.onLine) {
            //after put : http://www.olivettom.com/hb/index.php
            var serviceLookup = new ServiceLookup("http://www.olivettom.com/hb/index.php");
            serviceLookup.onError().subscribe((a) => this.onLookupError(a));
            serviceLookup.onResult().subscribe((ipAndPort) => this.onLookupSuccess(ipAndPort, project));
            serviceLookup.getService("RequestFlicker");
        }
        else{
            this.onLookupError("Impossible to Synchronize in offline mode");
        }
    }

    //########## Lookup handling###########

    private raiseResult(success : boolean, message : string) {
        this.onSynchronizationResultEvent.raise(new SyncResultEvent(success, message));
        console.log(message);
    }
    private onLookupError(error) {
        var errorMessage = "Error from ServiceLookup : " + error;
        this.raiseResult(false,errorMessage);
    }

    private onLookupSuccess(ipAndPort, project:Project) {
        var successMessage = "ServiceLookup sucessfull, found [" + ipAndPort + "]";
        console.log(successMessage);
        var requestFlicker = new RequestFlickerClient(ipAndPort);
        requestFlicker.onAnswer().subscribe((a) => this.handleAnswer(a, project));
        requestFlicker.onConnected().subscribe(() => console.log("Connected"));
        requestFlicker.onDisconnected().subscribe(() => console.log("Disconnected"));
        requestFlicker.onError().subscribe((a) => this.handleError(a));
        var toUpdate = this.getToUpdate(project);
        console.log('request last update'+project.lastUpdated+'total sent :'+toUpdate.length);
        var request = {
            "projectId": project.id,
            "lastUpdated": project.lastUpdated,
            "toUpdate": toUpdate
        };
        requestFlicker.request("SplitonSync", request);
    }

    //########## Service handling ###########
    private handleAnswer(answer, p:Project) {
        console.log("Answer received");
        //alert("received " + answer);
        var json = JSON.parse(answer);
        if (json.projectId != p.id) {
            alert("We received an answer with incorrect projectId " + answer.projectId);
        }
        var updatedNumber = 0;
        var membersInvolved = [];
        for (var indexTransactionToUpdate in json.toUpdate) {
            var newTransaction = new Transaction().deserialize(json.toUpdate[indexTransactionToUpdate]);
            var transactionIndex = p.transactions.map(function (e) {
                return e.id;
            }).indexOf(newTransaction.id);

            if(transactionIndex != -1) {
                var oldTransaction = p.transactions[transactionIndex];
                //We ignore the last(s) transactions
                if (newTransaction.lastUpdated == oldTransaction.lastUpdated)
                    continue;

                p.transactions.splice(transactionIndex, 1);
                console.log('transac update, was ' + oldTransaction.lastUpdated + 'new ' + newTransaction.lastUpdated + ' for ' + oldTransaction.comment);
            }
            else{
                console.log('new transac '+newTransaction.comment);
            }
            p.transactions.push(newTransaction);
            updatedNumber++;

            //alert('New transaction '+JSON.stringify(newTransaction));
            //We need to synchronize the members from to and from members
            if (p.members.indexOf(newTransaction.from) == -1) {
                p.members.push(newTransaction.from);
                //alert('adding member '+newTransaction.from);
            }

            for (var indexPotential in newTransaction.to) {
                var potentialNewMember = newTransaction.to[indexPotential];
                if (p.members.indexOf(potentialNewMember) == -1) {
                    p.members.push(potentialNewMember);
                    //alert('adding member '+potentialNewMember);
                }
            }
        }
        p.lastUpdated = json.lastUpdated;
        var syncInfo = (updatedNumber == 0) ? "(No new update)" : "("+updatedNumber+" new update(s))";
        this.lastSynchronized[p.id] = new Date().getTime();
        this.raiseResult(true,"Synchronisation successful "+syncInfo);
    }

    private handleError(errorEvent:ErrorEvent) {
        var errorString = errorEvent.message;
        if (errorString === undefined) {
            errorString = "This case happens when the websocket server reject our connection so far.";
        }
        //console.log("Synchronizer error : " + errorString);
        this.raiseResult(false,errorString);
    }

    private getToUpdate(p:Project) {
        var newResults = this.getLocalChanges(p);
        if(newResults.length == 0){
            newResults = Enumerable.from<Transaction>(p.transactions).where(function (y) {
                var result = y.lastUpdated == p.lastUpdated;
                return result;
            }).toArray().splice(0);
        }
        return newResults;
    }

    getLocalChanges(p) {
        var newResults = Enumerable.from<Transaction>(p.transactions).where(function (y) {
            var result = y.lastUpdated > p.lastUpdated;
            return result;
        }).toArray();
        return newResults;
    }
}
