module.exports = function (grunt) {
    "use strict";
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        karma: {
            options: {
                configFile: 'karma.conf.js'
            },
            unit: {},
            travis: {
                browsers: ['Firefox']
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
        },
        site: {
            options: {
                layout: 'docs/index.html'
            },
            index: {
                src: ['README.md'],
                dest: 'build/index.html'
            }
        },
        copy: {
            main: {
                expand: true,
                cwd: 'docs/',
                src: ['**', '!index.html'],
                dest: 'build/'
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadTasks('tasks/');

    grunt.registerTask('test', 'Run tests on singleRun karma server', function() {
        if (process.env.TRAVIS) {
            //this task can be executed in Travis-CI
            grunt.task.run('karma:travis');
        } else {
            grunt.task.run('karma:unit');
        }
    });

    grunt.registerTask('build', ['jshint', 'test', 'concat', 'uglify']);
    grunt.registerTask('demo', ['site', 'copy']);
    grunt.registerTask('default', ['build', 'demo']);
    return grunt;
};