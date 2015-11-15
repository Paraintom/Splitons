/// <reference path="../LiteEvent.ts" />
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
var RequestFlickerClient = (function () {
    function RequestFlickerClient(ipAndPort) {
        //Events
        this.onConnectedEvent = new LiteEvent();
        this.onDisconnectedEvent = new LiteEvent();
        this.onErrorEvent = new LiteEvent();
        this.onAnswerEvent = new LiteEvent();
        this.url = "ws://" + ipAndPort + "/";
    }
    RequestFlickerClient.prototype.onConnected = function () {
        return this.onConnectedEvent;
    };

    RequestFlickerClient.prototype.onDisconnected = function () {
        return this.onDisconnectedEvent;
    };

    RequestFlickerClient.prototype.onError = function () {
        return this.onErrorEvent;
    };

    RequestFlickerClient.prototype.onAnswer = function () {
        return this.onAnswerEvent;
    };

    RequestFlickerClient.prototype.request = function (serviceName, request) {
        var _this = this;
        try  {
            if (this.websocket != null) {
                //closing the existing connection
                this.websocket.onopen = null;
                this.websocket.onclose = null;
                this.websocket.onmessage = null;
                this.websocket.onerror = null;
                this.websocket.close();
            }
            this.websocket = new WebSocket(this.url);
            this.websocket.onopen = function (evt) {
                _this.onOpen(evt, serviceName, request);
            };
            this.websocket.onclose = function (evt) {
                _this.onClose(evt);
            };
            this.websocket.onmessage = function (evt) {
                _this.onMessageReceived(evt);
            };
            this.websocket.onerror = function (evt) {
                _this.onErrorReceived(evt);
            };
        } catch (error) {
            this.onErrorReceived(error);
        }
    };

    RequestFlickerClient.prototype.isConnected = function () {
        return this.websocket != null && this.websocket.readyState == WebSocket.OPEN;
    };

    RequestFlickerClient.prototype.doSend = function (message) {
        if (this.websocket != null) {
            this.websocket.send(message);
        }
    };

    RequestFlickerClient.prototype.onOpen = function (evt, serviceName, request) {
        this.onConnectedEvent.raise();

        //We send the request
        var serviceAndRequest = { "service": serviceName, "request": request };
        var msg = JSON.stringify(serviceAndRequest);
        this.doSend(msg);
    };

    RequestFlickerClient.prototype.onClose = function (evt) {
        this.onDisconnectedEvent.raise();
    };

    RequestFlickerClient.prototype.onMessageReceived = function (evt) {
        try  {
            var jsonString = evt.data;
            var jsonObj = JSON.parse(jsonString);
            if (jsonObj.hasOwnProperty('error')) {
                evt.message = jsonObj.error;
                this.onErrorReceived(evt);
            } else {
                this.onAnswerEvent.raise(jsonString);
            }
            this.websocket.close();
        } catch (error) {
            evt.message = error;
            this.onErrorReceived(evt);
        }
    };

    RequestFlickerClient.prototype.onErrorReceived = function (evt) {
        if (evt.hasOwnProperty('target') && evt.target.hasOwnProperty('readyState') && evt.target.readyState == 3) {
            evt.message = "The connection is closed or couldn't be opened.";
        }
        this.onErrorEvent.raise(evt);
    };
    return RequestFlickerClient;
})();
//# sourceMappingURL=RequestFlicker.js.map
