var Guid = (function () {
    function Guid() {
    }
    Guid.newGuid = function () {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    };
    Guid.isGuid = function (toTest) {
        var regexp = new RegExp('(^[^-]{8}-[^-]{4}-4[^-]{3}-[^-]{4}-[^-]{12}$)');
        var result = regexp.test(toTest);
        return result;
    };
    return Guid;
})();
//# sourceMappingURL=Guid.js.map