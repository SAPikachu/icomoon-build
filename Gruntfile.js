"use strict";

module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        jshint: {
            files: [
                "*.js",
                "lib/*.js",
                "bin/*"
            ],
            options: {
                curly: true,
                eqeqeq: true,
                immed: true,
                latedef: true,
                quotmark: true,
                undef: true,
                trailing: true,
                strict: true,
                globalstrict: true,

                node: true,
            }
        },
    });

    require("load-grunt-tasks")(grunt);
    grunt.registerTask("default",
    [
        "jshint",
    ]);
    grunt.registerTask("print_config", function() {
        grunt.log.writeln(JSON.stringify(grunt.config(), null, "  "));
    });
};