/// <reference path="IChannel.ts" />
var FastFlickerClient = (function () {
    function FastFlickerClient(ipAndPort, passphrase) {
        this.ipAndPort = ipAndPort;
        this.passphrase = passphrase;
        this.onReadyEvent = new LiteEvent();
        this.onMessageEvent = new LiteEvent();
        this.onErrorEvent = new LiteEvent();
        this.url = "ws://" + ipAndPort + "/";
        this.subject = 'Splitons/synchronisation/' + this.passphrase;
    }
    FastFlickerClient.prototype.open = function () {
        var _this = this;
        try  {
            this.websocket = new WebSocket(this.url);
            this.websocket.onopen = function (evt) {
                _this.onOpen(evt);
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
            this.onErrorEvent.raise(error.toString());
        }
    };

    FastFlickerClient.prototype.onOpen = function (evt) {
        console.debug('connection open for channel ' + this.subject);
        this.websocket.send(this.subject);
        this.onReadyEvent.raise();
    };

    FastFlickerClient.prototype.onClose = function (evt) {
        console.debug('onClose for ' + this.subject);
    };

    FastFlickerClient.prototype.onMessageReceived = function (evt) {
        try  {
            var message = evt.data;
            if (message == this.subject) {
                //this is the first echo, we ignore it.
                return;
            }
            this.onMessageEvent.raise(message);
        } catch (error) {
            this.onErrorEvent.raise(evt);
        }
    };

    FastFlickerClient.prototype.onErrorReceived = function (evt) {
        if (evt.hasOwnProperty('target') && evt.target.hasOwnProperty('readyState') && evt.target.readyState == 3) {
            evt.message = "The connection is closed or couldn't be opened.";
        }
        this.onErrorEvent.raise(evt.message);
    };

    FastFlickerClient.prototype.close = function () {
        try  {
            this.websocket.close();
        } catch (error) {
            this.onErrorEvent.raise(error);
        }
    };

    FastFlickerClient.prototype.send = function (message) {
        try  {
            if (this.websocket != null) {
                this.websocket.send(message);
            }
        } catch (error) {
            this.onErrorEvent.raise(error);
        }
    };

    FastFlickerClient.prototype.onReady = function () {
        return this.onReadyEvent;
    };

    FastFlickerClient.prototype.onMessage = function () {
        return this.onMessageEvent;
    };

    FastFlickerClient.prototype.onError = function () {
        return this.onErrorEvent;
    };
    return FastFlickerClient;
})();
//# sourceMappingURL=FastFlickerClient.js.map
