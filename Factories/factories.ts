/**
 * Created by Tom on 22/03/2015.
 */

///<reference path="../external/linq.d.ts"/>
///<reference path="../external/angular.d.ts"/>
///<reference path="../dataObjects/Project.ts"/>
///<reference path="../dataObjects/Transaction.ts"/>
///<reference path="../dataObjects/Guid.ts"/>


var projectsFactory = angular.module('projectsFactory', ['ngResource']);

projectsFactory.factory('projectsFactory', function () {

    var allProjects = [];
    init();

    function init() {
        for (var i = 0; i < localStorage.length; i++) {
            var projectId = localStorage.key(i);
            try {
                if (isProjectId(projectId)) {
                    var projectString = localStorage.getItem(projectId);
                    var json = JSON.parse(projectString);
                    var data = new Project().deserialize(json);
                    allProjects.push(data);

                }
            } catch (error) {
                console.error("LocalStorageService::readObject: can't convert string from local storage to object using JSON.parse(). Error: " + error);
            }
        }
    }

    function isProjectId(key) {
        return key.match("[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}");
    }


    return {
        saveProject: function (project) {
            localStorage.setItem(project.id,JSON.stringify(project));
        },
        deleteProject: function (id) {
            localStorage.removeItem(id);
        },
        getProject: function (id : string, projectName = id ) {
            if(Guid.isGuid(id)){
                var result = Enumerable.from(allProjects).where(o=>o.id == id).firstOrDefault();
                if (result == null) {
                    // This is used for synchronisation
                    result = this.getNewProject(projectName, id);
                }
                return result;
            }
            else {
                var result = Enumerable.from(allProjects).where(o=>o.name == id).firstOrDefault();
                if (result == null) {
                    throw new Error("Can't find project : " + id);
                }
                return result;
            }
        },
        getNewProject: function (name:string, id = name) {
            var result = Enumerable.from(allProjects).where(o=>o.id == id).firstOrDefault();
            if (result == null) {
                result = new Project();
                if(Guid.isGuid(id)) {
                    result.id = id;
                }
                result.name = name;
                //result = getFakeProject(name);
                allProjects.push(result);
                localStorage.setItem(result.id,JSON.stringify(result));
            }
            else{
                throw new Error("Can't create this project, it already exist!");
            }
            return result;
        },
        getAllProject: function () {
            return allProjects;
        }
    }
});