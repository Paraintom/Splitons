/// <reference path="../LiteEvent.ts" />
/// <reference path="../jquery.d.ts" />
var ServiceLookup = (function () {
    function ServiceLookup(lookupUrl) {
        this.onErrorEvent = new LiteEvent();
        this.onResultEvent = new LiteEvent();
        this.lookupUrl = lookupUrl;
        if (this.isNullOrEmpty(lookupUrl)) {
            this.lookupUrl = "ws://localhost:8181/";
        }
    }
    ServiceLookup.prototype.onError = function () {
        return this.onErrorEvent;
    };

    ServiceLookup.prototype.onResult = function () {
        return this.onResultEvent;
    };

    ServiceLookup.prototype.getService = function (serviceName) {
        var _this = this;
        if (this.lookupUrl.substring(0, 7) === "http://") {
            console.log('requesting...');
            var url = this.lookupUrl + "?get=" + serviceName;
            jQuery.support.cors = true;
            $.get(url, function (s) {
                console.log('request success' + s);
                _this.onResultEvent.raise(s.trim());
            }).fail(function (xhr, textStatus, errorThrown) {
                console.log('request failed' + textStatus + errorThrown);
                _this.onErrorEvent.raise(textStatus);
            });
        } else {
            if (this.lookupUrl.substring(0, 5) === "ws://") {
                this.onResultEvent.raise(this.lookupUrl.substring(5, this.lookupUrl.length));
            } else {
                this.onErrorEvent.raise("Invalid configuration : " + this.lookupUrl);
            }
        }
    };
    ServiceLookup.prototype.isNullOrEmpty = function (str) {
        return !(str != null && str.length);
    };
    return ServiceLookup;
})();
//# sourceMappingURL=ServiceLookup.js.map
