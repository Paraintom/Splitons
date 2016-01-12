///<reference path="../Guid.ts"/>
///<reference path="Serializable.ts"/>
///<reference path="Transaction.ts"/>
/**
 * Created by Tom on 09/03/2015.
 */

class Project implements Serializable<Project>{
    members= [];
    transactions = [];
    id : string;
    name:string;
    lastUpdated:number;

    public constructor(){
        this.id = Guid.newGuid();
        this.lastUpdated = 0;
    }

    GetLastUpdated() {
        return new Date(this.lastUpdated);
    }

    deserialize(input) {
        this.id = input.id;
        this.members = input.members;

        for(var index in input.transactions){
            this.transactions.push(new Transaction().deserialize(input.transactions[index]));
        }
        this.name = input.name;
        if(input.hasOwnProperty('lastUpdated')) {
            this.lastUpdated = input.lastUpdated;
        }
        return this;
    }
}
