///<reference path="../Guid.ts"/>
///<reference path="Serializable.ts"/>

/**
 * Created by Tom on 09/03/2015.
 */
class Transaction implements Serializable<Transaction>{
    id:string;
    lastUpdated:Date;
    from:string;
    to:string[];
    comment:string;
    amount:number;

    constructor() {
        this.id = Guid.newGuid();
    }

    GetLastUpdated() {
        return this.lastUpdated;
    }

    HasBeenUpdated() {
        this.lastUpdated = new Date();
    }

    deserialize(input) {
        this.id = input.id;
        this.lastUpdated = input.lastUpdated;
        this.from = input.from;
        this.to = input.to;
        this.comment = input.comment;
        this.amount = input.amount;
        return this;
    }
}