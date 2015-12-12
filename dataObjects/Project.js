///<reference path="../Guid.ts"/>
///<reference path="Serializable.ts"/>
///<reference path="Transaction.ts"/>
/**
* Created by Tom on 09/03/2015.
*/
var Project = (function () {
    function Project() {
        this.members = [];
        this.transactions = [];
        this.id = Guid.newGuid();
        this.lastUpdated = 0;
    }
    Project.prototype.GetLastUpdated = function () {
        return new Date(this.lastUpdated);
    };

    Project.prototype.HasBeenUpdated = function () {
        this.lastUpdated = new Date().getTime();
    };

    Project.prototype.deserialize = function (input) {
        this.id = input.id;
        this.members = input.members;

        for (var index in input.transactions) {
            this.transactions.push(new Transaction().deserialize(input.transactions[index]));
        }
        this.name = input.name;
        if (input.hasOwnProperty('lastUpdated')) {
            this.lastUpdated = input.lastUpdated;
        }
        return this;
    };
    return Project;
})();
//# sourceMappingURL=Project.js.map
