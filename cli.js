"use strict";

var icomoon = require("./icomoon");
var fs = require("fs");
var path = require("path");

var argv = require("optimist")
.demand("p")
.alias("p", "project")
.describe("p", "IcoMoon project file")
.describe("scss", "Output file name of converted SCSS stylesheet")
.describe("css", "Output file name of raw CSS stylesheet")
.describe("zip", "Output file name of generated zip package")
.describe("selection", "Output file name of selection.json")
.describe("fonts", "Output directory of font files")
.argv;

icomoon.buildProject(argv.project, function(err, result) {
    if (err) {
        throw err;
    }
    ["scss", "css", "zip", "selection"].forEach(function(key) {
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
});