/// <reference path="../LiteEvent.ts" />
/// <reference path="../linq/linq.d.ts"/>
/// <reference path="../RequestFlicker/ServiceLookup.ts" />
/// <reference path="../RequestFlicker/RequestFlicker.ts" />
/// <reference path="../RequestFlicker/ISynchronizer.ts" />
/// <reference path="../dataObjects/Project.ts" />
/// <reference path="IShareMechanism.ts"/>
///<reference path="FastFlickerClient.ts"/>
interface onReady {
    (channel: IChannel): void;
}

class ShareViaFastFlicker implements IShareMechanism {

    private onProjectReceivedEvent = new LiteEvent<ShareResultEvent>();
    onProjectReceived():ILiteEvent<ShareResultEvent> {
        return this.onProjectReceivedEvent;
    }
    private onErrorEvent = new LiteEvent<string>();
    onError():ILiteEvent<string> {
        return this.onErrorEvent;
    }

    share(projectId:string,projectName:string, passphrase:string) {
        if(navigator.onLine) {
            //after put : http://www.olivettom.com/hb/index.php
            var serviceLookup = new ServiceLookup("http://www.olivettom.com/hb/index.php");
            serviceLookup.onError().subscribe((a) => this.onLookupError(a));

            var whenReadyMethod :onReady;
            serviceLookup.onResult().subscribe((ipAndPort) => {
                whenReadyMethod = (ff) => this.whenReadySharing(ff, projectId, projectName, ipAndPort,passphrase, 0);
                this.onLookupSuccess(ipAndPort, passphrase,whenReadyMethod)
            });
            serviceLookup.getService("FastFlicker");
        }
        else{
            this.onLookupError("Impossible to Share project in offline mode");
        }
    }

    //TODO factorize with share...
    receive(passphrase:string) {
        if(navigator.onLine) {
            //after put : http://www.olivettom.com/hb/index.php
            var serviceLookup = new ServiceLookup("http://www.olivettom.com/hb/index.php");
            serviceLookup.onError().subscribe((a) => this.onLookupError(a));

            var whenReadyMethod :onReady;
            serviceLookup.onResult().subscribe((ipAndPort) => {
                whenReadyMethod = (ff) => console.debug('Connection open for '+ passphrase);
                this.onLookupSuccess(ipAndPort, passphrase ,whenReadyMethod)
            });
            serviceLookup.getService("FastFlicker");
        }
        else{
            this.onLookupError("Impossible to Share project in offline mode");
        }
    }

    //########## Lookup handling###########

    private onLookupError(error) {
        var errorMessage = "Error from ServiceLookup : " + error;
        this.raiseError(errorMessage);
    }

    private fastFlicker :IChannel;
    private onLookupSuccess(ipAndPort, passphrase:string, onReadyLogic : onReady) {
        var successMessage = "ServiceLookup sucessfull, found [" + ipAndPort + "]";
        console.log(successMessage);

        this.fastFlicker= new FastFlickerClient(ipAndPort,passphrase);
        this.fastFlicker.onMessage().subscribe((a) => this.handleAnswer(a));
        this.fastFlicker.onError().subscribe((a) => this.handleError(a));
        this.fastFlicker.onReady().subscribe(() => {
            onReadyLogic(this.fastFlicker);
        });

        this.fastFlicker.open();
    }

    private whenReadySharing(fastFlicker : IChannel, projectId:string, projectName:string, ipAndPort:string, passphrase:string, numberTry:number) {
        var toSend = new ShareResultEvent(projectId,projectName);
        console.log("Sending project via fastflicker...");
        fastFlicker.send(JSON.stringify(toSend));
        fastFlicker.close();
    }
    
    private raiseError(error : string) {
        this.onErrorEvent.raise(error);
        console.log(error);
    }

    //########## Service handling ###########
    private handleAnswer(answer) {
        console.log("Answer received");
        var json = JSON.parse(answer);
        if(Guid.isGuid(json.projectId)){
            this.onProjectReceivedEvent.raise(new ShareResultEvent(json.projectId,json.projectName));
            this.fastFlicker.close();
            console.log("Connection closed...");
        }
        else{
            console.warn('the answer is not a Guid!');
        }
    }

    private handleError(errorEvent:string) {
        var errorString = errorEvent;
        this.raiseError(errorString);
    }
}
