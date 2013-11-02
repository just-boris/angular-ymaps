module.exports = function (grunt) {
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        karma: {
            unit: {
                configFile: 'karma.conf.js'
            }
        },
        jshint: {
            files: ['<%= pkg.name %>.js']
        },
        concat: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            main: {
                src: ['<%= pkg.name %>.js'],
                dest: 'build/<%= pkg.name %>.js'
            }
        },
        uglify: {
            main: {
                src: 'build/<%= pkg.name %>.js',
                dest: 'build/<%= pkg.name %>.min.js'
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-karma');

    grunt.registerTask('default', ['jshint', 'karma', 'concat', 'uglify']);
    return grunt;
};