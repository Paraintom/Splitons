///<reference path="Guid.ts"/>
///<reference path="Serializable.ts"/>

/**
 * Created by Tom on 09/03/2015.
 */
class Transaction implements Serializable<Transaction>{
    id:string;
    deleted:boolean;
    createdDate:number;
    lastUpdated:number;
    from:string;
    to:string[];
    comment:string;
    amount:number;
    currency:string;

    constructor() {
        //It is a new Transaction, we WANT it to be synch!!
        this.createdDate = new Date().getTime();
        this.lastUpdated = this.createdDate * 2;
        this.deleted = false;
        this.id = Guid.newGuid();
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

        if(input.createdDate  === undefined) {
            //So much effort for something that should have been here since the start!
            //Our only hint on the creation date is the last updated date.
            // 1 - case unsync changes
            if(this.lastUpdated > new Date("2025").getTime()){
                this.createdDate = this.lastUpdated / 2;
            }
            else{
                this.createdDate = this.lastUpdated;
            }
            this.HasBeenUpdated();
        }
        else {
            this.createdDate = new Date(input.createdDate).getTime();
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