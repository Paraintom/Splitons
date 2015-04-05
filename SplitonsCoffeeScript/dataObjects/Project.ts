///<reference path="../Guid.ts"/>
/**
 * Created by Tom on 09/03/2015.
 */

class Project implements Serializable<Project>{
    members= [];
    transactions = [];
    id : string;
    name:string;
    public constructor(){
        this.id = Guid.newGuid();
    }

    deserialize(input) {
        this.id = input.id;
        this.members = input.members;
        //this.transactions
        for(var index in input.transactions){
            this.transactions.push(new Transaction().deserialize(input.transactions[index]));
        }
        this.name = input.name;
        return this;
    }
}
