///<reference path="Guid.ts"/>
/**
 * Created by Tom on 09/03/2015.
 */

class Project{
    members= [];
    transactions = [];
    id : string;
    public constructor(public name:string){
        this.id = Guid.newGuid();
    }
}
