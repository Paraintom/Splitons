/**
 * Created by Tom on 22/03/2015.
 */
///<reference path="../linq/linq.d.ts"/>
///<reference path="../angular.d.ts"/>
///<reference path="../Project.ts"/>
///<reference path="../Transaction.ts"/>
var projectsFactory = angular.module('projectsFactory', ['ngResource']);
projectsFactory.factory('projectsFactory', function () {
    var allProjects = [];
    init();
    function init() {
        for (var i = 0; i < localStorage.length; i++) {
            var projectId = localStorage.key(i);
            var projectString = localStorage.getItem(projectId);
            allProjects.push(JSON.parse(projectString));
        }
    }
    return {
        saveProject: function (project) {
            localStorage.setItem(project.id, JSON.stringify(project));
        },
        getProject: function (name) {
            var result = Enumerable.from(allProjects).where(function (o) { return o.name == name; }).firstOrDefault();
            if (result == null) {
                throw new Error("Can't find project : " + name);
            }
            return result;
        },
        getNewProject: function (name) {
            var result = Enumerable.from(allProjects).where(function (o) { return o.name == name; }).firstOrDefault();
            if (result == null) {
                result = new Project(name);
                //result = getFakeProject(name);
                allProjects.push(result);
                localStorage.setItem(result.id, JSON.stringify(result));
            }
            else {
                throw new Error("Can't create this project, it already exist!");
            }
            return result;
        },
        getAllProject: function () {
            return allProjects;
        }
    };
});
function getFakeProject(name) {
    var p = new Project(name);
    p.members.push("jean");
    p.members.push("emeline");
    p.members.push("antoine");
    p.members.push("roger");
    p.transactions.push(new Transaction("jean", ["emeline", "antoine"], "Beer", 20));
    p.transactions.push(new Transaction("emeline", ["jean", "antoine", "roger"], "Cab", 30));
    p.transactions.push(new Transaction("emeline", ["roger"], "chewing gum", 100));
    p.transactions.push(new Transaction("emeline", ["antoine"], "dictionary", 12));
    p.transactions.push(new Transaction("roger", ["emeline"], "a brain", 12));
    p.transactions.push(new Transaction("roger", ["antoine"], "Train", 12));
    return p;
}
//# sourceMappingURL=factories.js.map