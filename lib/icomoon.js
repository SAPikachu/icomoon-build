"use strict";

var fs = require("fs");
var console = require("console");
var util = require("util");
var path = require("path");
var childProcess = require("child_process");
var AdmZip = require("adm-zip");
var phantomjs = require("phantomjs");
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

function buildStylesheet(selection, type) {
    var typeInfo = sheetTypeInfo[type];
    if (!typeInfo) {
        throw new Error("Invalid stylesheet type: " + type);
    }
    var prefix = selection.preferences.fontPref.prefix;
    var contentDeclarations = "";
    var mainMixin = "";
    selection.icons.forEach(function(iconEntry) {
        var props = iconEntry.properties;
        contentDeclarations += util.format("%s%s%s-content: \"\\%s\";\n", typeInfo.varPrefix, prefix, props.name, props.code.toString(16));
        mainMixin += util.format(".%s%s:before { content: %s%s%s-content; }\n", prefix, props.name, typeInfo.varPrefix, prefix, props.name);
    });
    var output = "";
    output += "// Script-generated file, do not modify by hand\n\n";
    output += contentDeclarations;
    output += "\n";
    output += util.format(typeInfo.mixinPrefixFormat + " {\n", prefix);
    output += "    " + mainMixin.replace(/\n(?=.+?)/g, "\n    ");
    output += "}\n";
    return output;
}

function buildScssSheet(selection) {
    return buildStylesheet(selection, "scss");
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
