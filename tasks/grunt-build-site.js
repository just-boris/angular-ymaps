/* jshint node: true*/
var markdown = require('node-markdown').Markdown;
module.exports = function(grunt) {
    "use strict";
    grunt.registerMultiTask('site', 'build site assets', function() {
        var options = this.options();
        this.files.forEach(function(filePair) {
            var pages = filePair.src.map(grunt.file.read).map(markdown).join("\n"),
                template = grunt.file.read(options.layout),
                result = grunt.template.process(template, {data:{content: pages}});
            grunt.file.write(filePair.dest, result);
        });
    });
};
