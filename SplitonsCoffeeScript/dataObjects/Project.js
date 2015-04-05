///<reference path="../Guid.ts"/>
/**
 * Created by Tom on 09/03/2015.
 */
var Project = (function () {
    function Project() {
        this.members = [];
        this.transactions = [];
        this.id = Guid.newGuid();
    }
    Project.prototype.deserialize = function (input) {
        this.id = input.id;
        this.members = input.members;
        for (var index in input.transactions) {
            this.transactions.push(new Transaction().deserialize(input.transactions[index]));
        }
        this.name = input.name;
        return this;
    };
    return Project;
})();
//# sourceMappingURL=Project.js.map