/* jshint node: true*/
var markdown = require('node-markdown').Markdown,
    _ = require('underscore'),
    path = require('path');

module.exports = function(grunt) {
    "use strict";
    function readMD(file) {
        return markdown(grunt.file.read(file));
    }
    function readFile(file) {
        switch (path.extname(file)) {
            case "":       return file;
            case ".json":  return grunt.file.readJSON(file);
            case ".md":    return readMD(file);
            default:       return grunt.file.read(file);
        }
    }

    grunt.registerMultiTask('examples', 'build site assets', function() {
        var options = this.options(),
            template = grunt.file.read(options.layout);
        this.files.forEach(function(filePair) {
            var pages = filePair.src.map(grunt.file.read).join("\n"),
                result = grunt.template.process(template, {data:{content: pages}});
            grunt.file.write(filePair.dest, result);
        });
    });

    grunt.registerMultiTask('index', 'build index.html', function() {
        function processData(data) {
            _.each(data, function(val, key, list) {
                if(typeof val === 'string') {
                    list[key] = readFile(val);
                }
                else {
                    processData(val);
                }
            });
        }
        processData(this.data);
        var options = this.options(),
            template = grunt.file.read(options.layout),
            result = grunt.template.process(template, {data:this.data});
        grunt.file.write(options.dest, result);
    });
};
