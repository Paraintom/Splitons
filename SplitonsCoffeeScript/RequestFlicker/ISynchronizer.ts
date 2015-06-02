/// <reference path="LiteEvent.ts" />
/// <reference path="../dataObjects/Project.ts" />
interface ISynchronizer {
    synchronize(project:Project);
    onSynchronized(): ILiteEvent<SyncResultEvent>
}

class SyncResultEvent {
    constructor(public success:boolean, public message:string){}
}