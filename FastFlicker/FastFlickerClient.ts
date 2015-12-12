/// <reference path="IChannel.ts" />
class FastFlickerClient implements IChannel {
    private websocket:WebSocket;
    private subject:string;
    private url:string;

    constructor(public ipAndPort:string, public passphrase:string) {
        this.url = "ws://" + ipAndPort + "/";
        this.subject = 'Splitons/synchronisation/' + this.passphrase;
    }

    public open(){
        try {
            this.websocket = new WebSocket(this.url);
            this.websocket.onopen = evt => {
                this.onOpen(evt);
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
            this.onErrorEvent.raise(error.toString());
        }
    }

    private onOpen(evt:Object) {
        console.debug('connection open for channel ' + this.subject);
        this.websocket.send(this.subject);
        this.onReadyEvent.raise();
    }

    private onClose(evt:Object) {
        console.debug('onClose for ' + this.subject);
    }

    private onMessageReceived(evt:any) {
        try {
            var message = evt.data;
            if (message == this.subject) {
                //this is the first echo, we ignore it.
                return;
            }
            this.onMessageEvent.raise(message);
        }
        catch (error) {
            this.onErrorEvent.raise(evt);
        }
    }

    private onErrorReceived(evt:any) {
        if (evt.hasOwnProperty('target') && evt.target.hasOwnProperty('readyState') && evt.target.readyState == 3) {
            evt.message = "The connection is closed or couldn't be opened.";
        }
        this.onErrorEvent.raise(evt.message);
    }

    close() {
        try {
            this.websocket.close();
        }
        catch (error) {
            this.onErrorEvent.raise(error);
        }
    }

    send(message:string) {
        try {
            if (this.websocket != null) {
                this.websocket.send(message);
            }
        }
        catch (error) {
            this.onErrorEvent.raise(error);
        }
    }

    private onReadyEvent = new LiteEvent<void>();
    public onReady():ILiteEvent<void> {
        return this.onReadyEvent;
    }

    private onMessageEvent = new LiteEvent<string>();
    public onMessage():ILiteEvent<string> {
        return this.onMessageEvent;
    }

    private onErrorEvent = new LiteEvent<string>();
    public onError():ILiteEvent<string> {
        return this.onErrorEvent;
    }

}