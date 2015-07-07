/**
 * Created by Tom on 24/06/2015.
 */
/// <reference path="../LiteEvent.ts" />
interface IChannel {
    open();
    close();
    send(message:string);
    onReady(): ILiteEvent<void>;
    onMessage(): ILiteEvent<string>;
    onError(): ILiteEvent<string>;
}
