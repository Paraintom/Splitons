/// <reference path="LiteEvent.ts" />
// Interface : 
// 1 - Create the chat object ---> 
//  url = "ws://"+ip+":"+port+"/";
//	chat = new RequestFlickerClient(url);
// 2- Listen to events ---> 
// onNewMessage mainly :
//this.chat.onAnswer.subscribe(function (a) {
//    return _this.span.innerHTML += "Answer received:" + a + " \n";
//});
// But also other events ():
//this.chat.onConnected.subscribe(function () {
//    return _this.span.innerHTML += "Connected \n";
//});
//this.chat.onDisconnected.subscribe(function () {
//    return _this.span.innerHTML += "Disconnected \n";
//});
//this.chat.onError.subscribe(function (a) {
//    return _this.span.innerHTML += "Error:" + a.message + " \n";
//});
// 3- Then send request and wait for answer! --->
//	chat.request("echoService", jsonRequest);
//                              Enjoy!
class RequestFlickerClient {
    url:string;
    websocket:WebSocket;

    //Events
    private onConnectedEvent = new LiteEvent<void>();

    public onConnected():ILiteEvent<void> {
        return this.onConnectedEvent;
    }

    private onDisconnectedEvent = new LiteEvent<void>();

    public onDisconnected():ILiteEvent<void> {
        return this.onDisconnectedEvent;
    }

    private onErrorEvent = new LiteEvent<ErrorEvent>();

    public onError():ILiteEvent<ErrorEvent> {
        return this.onErrorEvent;
    }

    private onAnswerEvent = new LiteEvent<string>();

    public onAnswer():ILiteEvent<string> {
        return this.onAnswerEvent;
    }

    constructor(ipAndPort:string) {
        this.url = "ws://" + ipAndPort + "/";
    }

    public request(serviceName:string, request:any) {
        try {
            if (this.websocket != null) {
                //closing the existing connection
                this.websocket.onopen = null;
                this.websocket.onclose = null;
                this.websocket.onmessage = null;
                this.websocket.onerror = null;
                this.websocket.close();
            }
            this.websocket = new WebSocket(this.url);
            this.websocket.onopen = evt => {
                this.onOpen(evt, serviceName, request);
            };
            this.websocket.onclose = evt => {
                this.onClose(evt);
            };
            this.websocket.onmessage = evt => {
                this.onMessageReceived(evt);
            };
            this.websocket.onerror = evt => {
                this.onErrorReceived(evt);
            };
        } catch (error) {
            this.onErrorReceived(error)
        }
    }

    public isConnected() {
        return this.websocket != null
            && this.websocket.readyState == WebSocket.OPEN;
    }

    private doSend(message:string) {
        if (this.websocket != null) {
            this.websocket.send(message);
        }
    }

    private onOpen(evt:Object, serviceName:string, request:any) {
        this.onConnectedEvent.raise();
        //We send the request
        var serviceAndRequest = {"service": serviceName, "request": request}
        var msg = JSON.stringify(serviceAndRequest);
        this.doSend(msg);
    }

    private onClose(evt:Object) {
        this.onDisconnectedEvent.raise();
    }

    private onMessageReceived(evt:any) {
        try {
            var jsonString = evt.data;
            var jsonObj = JSON.parse(jsonString);
            if (jsonObj.hasOwnProperty('error')) {
                evt.message = jsonObj.error;
                this.onErrorReceived(evt);
            }
            else {
                this.onAnswerEvent.raise(jsonString);
            }
            this.websocket.close();
        }
        catch (error) {
            evt.message = error;
            this.onErrorReceived(evt);
        }
    }

    private onErrorReceived(evt:any) {
        if(evt.hasOwnProperty('target') && evt.target.hasOwnProperty('readyState') && evt.target.readyState == 3){
            evt.message = "The connection is closed or couldn't be opened.";
        }
        this.onErrorEvent.raise(evt);
    }
}