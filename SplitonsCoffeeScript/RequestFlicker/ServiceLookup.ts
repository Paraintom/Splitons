/// <reference path="LiteEvent.ts" />
/// <reference path="../jquery.d.ts" />
class ServiceLookup {
    private lookupUrl: string;
    private onErrorEvent = new LiteEvent<string>();
    public onError(): ILiteEvent<string> { return this.onErrorEvent; }
    private onResultEvent = new LiteEvent<string>();
    public onResult(): ILiteEvent<string> { return this.onResultEvent; }

    constructor(lookupUrl : string) {
        this.lookupUrl = lookupUrl;
        if (this.isNullOrEmpty(lookupUrl)) {
            this.lookupUrl = "ws://localhost:8181/";
        }
    }

    getService(serviceName) {
        if (this.lookupUrl.substring(0,7) === "http://") {
            console.log('requesting...');
            var url = this.lookupUrl + "?get=" + serviceName;
            jQuery.support.cors = true;
            $.get(url, (s) => {
                console.log('request success' + s);
                this.onResultEvent.raise(s.trim());

            }).fail(
                (xhr, textStatus, errorThrown) => {
                    console.log('request failed' + textStatus + errorThrown);
                    this.onErrorEvent.raise(textStatus);
                });
        } else {
            if (this.lookupUrl.substring(0, 5) === "ws://") {
                this.onResultEvent.raise(this.lookupUrl.substring(5, this.lookupUrl.length));
            } else {
                this.onErrorEvent.raise("Invalid configuration : "+this.lookupUrl);

            }
        }
    }
    isNullOrEmpty(str: string) {
        return !(str != null && str.length);
    }
}