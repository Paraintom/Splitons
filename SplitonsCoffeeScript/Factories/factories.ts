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
    allProjects.push(getFakeProject("test1"));
    allProjects.push(getFakeProject("test2"));
    allProjects.push(getFakeProject("test3"));

    return {
        get: function (name) {

            var result = Enumerable.from(allProjects).where(o=>o.name == name).firstOrDefault();
            if (result == null) {
                result = getFakeProject(name)
                allProjects.push(result);
            }
            return result;
        },
        getAll: function () {
            return allProjects;
        }
    }
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