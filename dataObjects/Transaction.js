///<reference path="../Guid.ts"/>
///<reference path="Serializable.ts"/>
/**
* Created by Tom on 09/03/2015.
*/
var Transaction = (function () {
    function Transaction() {
        this.lastUpdated = 1;
        this.deleted = false;
        this.id = Guid.newGuid();
    }
    Transaction.prototype.GetLastUpdated = function () {
        return new Date(this.lastUpdated);
    };

    Transaction.prototype.HasBeenUpdated = function () {
        this.lastUpdated = new Date().getTime();
    };

    Transaction.prototype.deserialize = function (input) {
        this.id = input.id;

        //backward compatible mode ...
        if (input.lastUpdated instanceof Date) {
            this.lastUpdated = input.lastUpdated.getTime();
        } else {
            if (input.lastUpdated === undefined) {
                this.lastUpdated = 1;
            } else {
                this.lastUpdated = new Date(input.lastUpdated).getTime();
            }
        }
        this.deleted = input.deleted == true;
        this.from = input.from;
        this.to = input.to;
        this.comment = input.comment;
        this.amount = input.amount;
        this.currency = input.currency ? input.currency : " ";
        return this;
    };
    return Transaction;
})();
//# sourceMappingURL=Transaction.js.map
