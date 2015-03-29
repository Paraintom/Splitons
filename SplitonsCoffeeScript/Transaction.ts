///<reference path="Guid.ts"/>
/**
 * Created by Tom on 09/03/2015.
 */
class Transaction{
    id : string;
    constructor(public from:string, public to:string[], public comment:string, public amount:number){
        this.id = Guid.newGuid();
    }
}