///<reference path="Guid.ts"/>
/**
 * Created by Tom on 09/03/2015.
 */
var Project = (function () {
    function Project(name) {
        this.name = name;
        this.members = [];
        this.transactions = [];
        this.id = Guid.newGuid();
    }
    return Project;
})();
//# sourceMappingURL=Project.js.map