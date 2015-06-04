///<reference path="../Guid.ts"/>
///<reference path="Serializable.ts"/>

/**
 * Created by Tom on 09/03/2015.
 */
class Transaction implements Serializable<Transaction>{
    id:string;
    deleted:boolean;
    lastUpdated:number;
    from:string;
    to:string[];
    comment:string;
    amount:number;
    currency:string;

    constructor() {
        this.lastUpdated = 1;
        this.deleted = false;
        this.id = Guid.newGuid();
    }

    GetLastUpdated() {
        return new Date(this.lastUpdated);
    }

    HasBeenUpdated() {
        this.lastUpdated = new Date().getTime();
    }

    deserialize(input) {
        this.id = input.id;
        //backward compatible mode ...
        if(input.lastUpdated instanceof Date) {
            this.lastUpdated = input.lastUpdated.getTime();
        }
        else{
            if(input.lastUpdated  === undefined) {
                this.lastUpdated = 1;
            }
            else {
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
    }
}