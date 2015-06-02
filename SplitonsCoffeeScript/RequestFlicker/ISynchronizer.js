/// <reference path="LiteEvent.ts" />
/// <reference path="../dataObjects/Project.ts" />
var SyncResultEvent = (function () {
    function SyncResultEvent(success, message) {
        this.success = success;
        this.message = message;
    }
    return SyncResultEvent;
})();
//# sourceMappingURL=ISynchronizer.js.map