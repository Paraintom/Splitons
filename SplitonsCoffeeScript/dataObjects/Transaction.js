///<reference path="../Guid.ts"/>
///<reference path="Serializable.ts"/>
/**
 * Created by Tom on 09/03/2015.
 */
var Transaction = (function () {
    function Transaction() {
        this.id = Guid.newGuid();
    }
    Transaction.prototype.GetLastUpdated = function () {
        return this.lastUpdated;
    };
    Transaction.prototype.HasBeenUpdated = function () {
        this.lastUpdated = new Date();
    };
    Transaction.prototype.deserialize = function (input) {
        this.id = input.id;
        this.lastUpdated = input.lastUpdated;
        this.from = input.from;
        this.to = input.to;
        this.comment = input.comment;
        this.amount = input.amount;
        return this;
    };
    return Transaction;
})();
//# sourceMappingURL=Transaction.js.map