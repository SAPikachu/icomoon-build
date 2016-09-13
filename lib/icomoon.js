"use strict";

var fs = require("fs");
var console = require("console");
var util = require("util");
var path = require("path");
var childProcess = require("child_process");
var AdmZip = require("adm-zip");
var phantomjs = require("phantomjs-prebuilt");
var binPath = phantomjs.path;

var sheetTypeInfo = {
    scss: {
        varPrefix: "$",
        mixinPrefixFormat: "@mixin %sclasses"
    },
    less: {
        varPrefix: "@",
        mixinPrefixFormat: ".%sclasses()"
    }
};

function buildStylesheet(selection, type, with_map) {
    var typeInfo = sheetTypeInfo[type];
    if (!typeInfo) {
        throw new Error("Invalid stylesheet type: " + type);
    }
    var prefix = selection.preferences.fontPref.prefix;
    var contentDeclarations = "";
    var mainMixin = "";
    var sassMapItems = [];
    selection.icons.forEach(function(iconEntry) {
        var props = iconEntry.properties;
        var splittedNames = props.name.split(",");
        for (let name of splittedNames) {
            name = name.trim();
            contentDeclarations += util.format("%s%s%s-content: \"\\%s\";\n", typeInfo.varPrefix, prefix, name, props.code.toString(16));
            mainMixin += util.format(".%s%s:before { content: %s%s%s-content; }\n", prefix, name, typeInfo.varPrefix, prefix, name);
            sassMapItems.push(util.format("'%s': '\\%s'", name, props.code.toString(16)));
        }
    });
    var output = "";
    output += "// Script-generated file, do not modify by hand\n\n";
    output += contentDeclarations;
    output += "\n";
    if (type === "scss" && with_map) {
        output += util.format("%s%sitem-map: (%s);\n\n", typeInfo.varPrefix, prefix, sassMapItems.join(", "));
    }
    output += util.format(typeInfo.mixinPrefixFormat + " {\n", prefix);
    output += "    " + mainMixin.replace(/\n(?=.+?)/g, "\n    ");
    output += "}\n";
    return output;
}

function buildScssSheet(selection, with_map) {
    return buildStylesheet(selection, "scss", with_map);
}

function buildLessSheet(selection) {
    return buildStylesheet(selection, "less");
}

function buildProject(projectFilePath, cb) {
    var childArgs = [
        "--load-images=false",
        "--ssl-protocol=any",
        path.join(__dirname, "icomoon.phantom.js"),
        projectFilePath
    ];
    childProcess.execFile(binPath, childArgs, {maxBuffer: 102400*1024}, function(err, stdout, stderr) {
        if (err) {
            cb(err);
            return;
        }
        var result;
        try {
            var zipBuf = new Buffer(stdout, "base64");
            var zip = new AdmZip(zipBuf);
            var zipEntries = zip.getEntries(); // an array of ZipEntry records

            result = {
                zip: zipBuf,
                fonts: {}
            };
            zipEntries.forEach(function(zipEntry) {
                if (/.+\/.*\.(ttf|woff|eot|svg)$/.test(zipEntry.entryName)) {
                    result.fonts[zipEntry.name] = {
                        path: zipEntry.entryName,
                        data: zip.readFile(zipEntry),
                    };
                } else if (/^[^\/]+\.css$/.test(zipEntry.entryName)) {
                    result.css = zip.readAsText(zipEntry);
                } else if ("selection.json" === zipEntry.entryName) {
                    result.selection = JSON.parse(zip.readAsText(zipEntry));
                }
            });
            result.scss = buildScssSheet(result.selection);
            result.scss_with_map = buildScssSheet(result.selection, true);
            result.less = buildLessSheet(result.selection);
        } catch (e) {
            cb(e);
            return;
        }
        cb(null, result);
    });
}

module.exports = {
    buildProject: buildProject,
    buildScssSheet: buildScssSheet,
    buildLessSheet: buildLessSheet,
};
