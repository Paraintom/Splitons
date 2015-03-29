///<reference path="Guid.ts"/>
/**
 * Created by Tom on 09/03/2015.
 */
var Transaction = (function () {
    function Transaction(from, to, comment, amount) {
        this.from = from;
        this.to = to;
        this.comment = comment;
        this.amount = amount;
        this.id = Guid.newGuid();
    }
    return Transaction;
})();
//# sourceMappingURL=Transaction.js.map