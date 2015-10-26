module.exports = function (grunt) {
    'use strict';
    function getExamplesForPages(examples) {
        var result = {};
        examples.forEach(function(example) {
            result['build/examples/'+example+'/index.html'] = [baseDir+example+'/index.tpl.html', baseDir+example+'/data.json'];
        });
        return result;
    }
    function getExamplesForIndex(examples) {
        return examples.map(function(example) {
            return {
                name: example,
                data: baseDir+example+'/data.json',
                html: baseDir+example+'/index.tpl.html',
                js: baseDir+example+'/script.js'
            };
        });
    }
    var baseDir = 'docs/examples/',
        examples = [
        'simple-marker',
        'color-marker',
        'markers-array',
        'clusterize',
        'markers-text',
        'balloons',
        'update-center',
        'map-toggle',
        'multi-map'
    ];

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        karma: {
            options: {
                configFile: 'karma.conf.js',
                browsers: ['Firefox']
            },
            unit: {},
            travis: {}
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
        examples: {
            options: {
                layout: 'docs/example.tpl.html'
            },
            examples: {
                files: getExamplesForPages(examples)
            }
        },
        index: {
            options: {
                layout: 'docs/index.tpl.html',
                dest: 'build/index.html'
            },
            files: {
                readme: 'README.md',
                examples: getExamplesForIndex(examples),
                contrib: 'CONTRIBUTING.md'
            }
        },
        copy: {
            main: {
                expand: true,
                cwd: 'docs/',
                src: ['**', '!**/*.tpl.html'],
                dest: 'build/'
            }
        },
        buildcontrol: {
            options: {
                dir: 'build',
                connectCommits: false,
                commit: true,
                push: true,
                message: 'Built %sourceName% from commit %sourceCommit% on branch %sourceBranch%'
            },
            pages: {
                options: {
                    remote: 'git@github.com:just-boris/angular-ymaps.git',
                    branch: 'gh-pages'
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-build-control');
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
    grunt.registerTask('demo', ['index', 'examples', 'copy']);
    grunt.registerTask('demo-notests', ['jshint', 'concat', 'uglify', 'demo']);
    grunt.registerTask('default', ['build', 'demo']);
    grunt.registerTask('build-gh', ['default', 'buildcontrol:pages']);
    return grunt;
};
