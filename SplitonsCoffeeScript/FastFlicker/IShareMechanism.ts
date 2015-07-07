/// <reference path="../LiteEvent.ts" />
/// <reference path="../dataObjects/Project.ts" />
interface IShareMechanism {
    share(projectId:string, projectName:string, passphrase:string);
    onProjectReceived(): ILiteEvent<ShareResultEvent>
    onError(): ILiteEvent<string>
}
class ShareResultEvent {
    constructor(public projectId:string, public projectName:string){}
}