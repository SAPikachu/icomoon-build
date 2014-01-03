// jshint phantom: true

"use strict";

var page = require("webpage").create();
var system = require("system");
var fs = require("fs");

page.onError = function(msg, trace) {
    var msgStack = ["ERROR: " + msg];
    if (trace) {
        msgStack.push("TRACE:");
        trace.forEach(function(t) {
            msgStack.push(" -> " + t.file + ": " + t.line + (t["function"] ? " (in function \"" + t["function"] + "\")" : ""));
        });
    }
    system.stderr.writeLine(msgStack.join("\n"));
    phantom.exit(2);
};
page.onConsoleMessage = function(msg, lineNum, sourceId) {
    if (msg.slice(0, 6) === "!DATA!") {
        system.stdout.write(msg.slice(6));
        phantom.exit(0);
        return;
    }
    system.stderr.writeLine("CONSOLE: " + msg + " (from line #" + lineNum + " in \"" + sourceId + "\")");
};
page.onLoadStarted = function() {
    system.stderr.writeLine("onLoadStarted: " + page.url);
    system.stderr.writeLine(" -- ");
};

page.onLoadFinished = function(status) {
    system.stderr.writeLine("onLoadFinished: " + page.url);
    system.stderr.writeLine("Status: " + status);
    system.stderr.writeLine(" -- ");
};
page.onNavigationRequested = function(url, type, willNavigate, main) {
    system.stderr.writeLine("onNavigationRequested: " + url);
    system.stderr.writeLine("type: " + type);
    system.stderr.writeLine("willNavigate: " + willNavigate);
    system.stderr.writeLine("main: " + main);
    system.stderr.writeLine(" -- ");
};
var project;
try {
    project = JSON.parse(fs.read(system.args[1]));
} catch (e) {
    system.stderr.writeLine("Unable to read project file:");
    system.stderr.writeLine(e.toString());
    phantom.exit(1);
}
page.open("http://icomoon.io/app/", function() {
    page.evaluate(function(project) {
        // jshint browser: true, -W034
        /* global angular */
        "use strict";

        var injector = angular.element(document.body).injector();
        var session = injector.get("session");
        var $controller = injector.get("$controller");
        var $rootScope = injector.get("$rootScope");
        var $q = injector.get("$q");
        var $timeout = injector.get("$timeout");
        var $http = injector.get("$http");
        var scope = $rootScope.$new();
        $http.post = function(url, params) {
            console.log("!DATA!" + params.file);
            return $q.defer().promise();
        };
        session.load().then(function(icomoon) {
            icomoon.currentProject = 0;
            icomoon.projects = [project];
            var main = $controller("MainCtrl", {
                icomoon: icomoon,
                $scope: scope
            });
            var font = $controller("FontCtrl", {
                $scope: scope
            });
            return $timeout(function(){}, 0);
        }, $q.reject).then(function() {
            scope.download();
        }, $q.reject).then(function(){},function(e) {
            console.error(e);
            setTimeout(function() {
                throw e;
            }, 0);
        });
        $rootScope.$apply();
    }, project);
});