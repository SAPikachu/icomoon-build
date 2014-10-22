"use strict";

var icomoon = require("./icomoon");
var fs = require("fs");
var path = require("path");

module.exports = function(argv, cb) {
    icomoon.buildProject(argv.project, function(err, result) {
        if (err) {
            if (typeof cb === "function") {
                cb(err, result);
                return;
            } else {
                throw err;
            }
        }
        ["scss", "scss_with_map", "less", "css", "zip", "selection"].forEach(function(key) {
            if (argv[key]) {
                var content = result[key];
                if (key === "selection") {
                    content = JSON.stringify(content, null, " ");
                }
                fs.writeFileSync(argv[key], content);
            }
        });
        if (argv.fonts) {
            Object.keys(result.fonts).forEach(function(name) {
                fs.writeFileSync(path.join(argv.fonts, name), result.fonts[name].data);
            });
        }
        if (typeof cb === "function") {
            cb(err, result);
        }
    });
};