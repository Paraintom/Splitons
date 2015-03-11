///<reference path="angular.d.ts"/>
///<reference path="Project.ts"/>
///<reference path="Transaction.ts"/>
///<reference path="Balance.ts"/>

angular.module('splitonsApp', []).controller('FakeDataController', ['$scope', function($scope) {

    var p = getFakeProject();
    $scope.projectName = p.name;
    $scope.transactions = p.transactions;
    $scope.members = p.members;
    $scope.balances = calculateBalances();

    function calculateBalances() {
        var result: { [id: string] : Balance; } = {};
        //Initialisation
        p.members.forEach(m=>result[m] = new Balance(m,0));
        //Computation
        p.transactions.forEach(t=>{
            result[t.from].amount += t.amount;
            var numberOfDebiter = t.to.length;

            t.to.forEach(debitor=> {
                result[debitor].amount -= (t.amount / numberOfDebiter);
            });
        });
        return result;
    }
}]);


function getFakeProject() {
    var p = new Project("fakeProject");
    p.members.push("jean");
    p.members.push("emeline");
    p.members.push("antoine");
    p.members.push("roger");

    p.transactions.push(new Transaction("jean", ["emeline", "antoine"], "Beer", 20));
    p.transactions.push(new Transaction("emeline", ["jean", "antoine", "roger"], "Cab", 30));
    p.transactions.push(new Transaction("emeline", ["roger"], "chewing gum", 100));
    /*p.transactions.push(new Transaction("emeline", ["antoine"], "dictionary", 12));
    p.transactions.push(new Transaction("roger", ["emeline"], "a brain", 12));
    p.transactions.push(new Transaction("roger", ["antoine"], "Train", 12));*/
    return p;
}