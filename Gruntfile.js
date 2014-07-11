/**
 * Gruntfile for angular-seed projects
 *
 * @author ConcurrentHashMap <ConcurrentHashMap@arcor.de>
 * @license Licensed under MIT (https://github.com/ConcurrentHashMap/angular-seed-gruntfile/blob/master/LICENSE)
 */
'use strict';

module.exports = function (grunt) {
    grunt.initConfig({
        // **Define some global variables here that may be needed in multiple Grunt packages:**

        // Read the package.json to access package name and version inside the Gruntfile
        pkg: grunt.file.readJSON('package.json'),

        // Banner will be added to css and js output on building
        banner: '/*! <%= pkg.name %>@<%= pkg.version %>-build.<%= grunt.template.today() %> */\n',

        server: { 
            hostname: 'localhost',
            port: 8000,
            livereload: 35729
        },

        // Define files that are important for every task
        src: ['Gruntfile.js', 'app/js/**/*.js', 'test/unit/**/*.js'],

        // **Configure task options for non-alias tasks loaded by grunt.loadNpmTasks:**

        // As the browser will not allow [Cross-Origin Resource Sharing](https://en.wikipedia.org/wiki/Cross-origin_resource_sharing) when opening `index.html` from local file system,
        // we need to run a local server with the connect task.
        connect: {
            dev: {
                options: {
                    hostname: '<%= server.hostname %>',
                    port: '<%= server.port %>',
                    base: 'app',
                    // If livereload is set, connect will insert a script tag inside the html to connect to the livereload server on the specified port
                    livereload: '<%= server.livereload %>',
                    // A browser window will be opened after successful start
                    open: {
                        target: 'http://<%= server.hostname %>:<%= server.port %>'
                    }
                }
            },
            postbuild: {
                options: {
                    hostname: '<%= server.hostname %>',
                    port: '<%= server.port %>',
                    base: 'dist',
                    // Keep the browser alive. Needed only if not running in combination with watch
                    keepalive: true,
                    // A browser window will be opened after successful start
                    open: {
                        target: 'http://<%= server.hostname %>:<%= server.port %>'
                    }
                }
            }
        },

        // Watch task will monitor defined files for changes and trigger a livereload if changes are detected
        watch: {
            livereload: {
                options: {
                    livereload: '<%= server.livereload %>'
                },
                files: ['<%= src %>', 'app/index.html', 'app/css/app.css']
            }
        },

        // Uglify reduces file size by minimizing variable names (so `someReallyLongVariableName` will simply stripped to `a`).
        // That's really ugly, but will reduce page load time and bandwith for distribution
        uglify: {
            dist: {
                files: {
                    'dist/js/<%= pkg.name %>.min.js': ['dist/js/<%= pkg.name %>.min.js']
                }
            }
        },

        // Minimize html files
        htmlmin: {
            dist: {
                options: {
                    collapseBooleanAttributes: true,
                    collapseWhitespace: true,
                    removeAttributeQuotes: true,
                    removeComments: true,
                    removeCommentsFromCDATA: true,
                    removeEmptyAttributes: true,
                    removeOptionalTags: true,
                    removeRedundantAttributes: true,
                    useShortDoctype: true
                },
                files: [{
                    'dist/index.html': 'dist/index.html'
                }, {
                    expand: true,
                    cwd: 'app/partials',
                    src: '**/*.html',
                    dest: 'dist/partials/'
                }]
            }
        },

        // Prepare options for concat and uglify based on html comments (`<!-- build:<type> <path> -->`)
        useminPrepare: {
            html: 'app/index.html',
            options: {
                root: 'app',
                dest: 'dist',
                flow: {
                    html: {
                        steps: {
                            // Confusing: use uglifyjs if you want to use uglify here as the library is meant, not the task
                            js: ['concat'],
                            css: ['concat', 'cssmin']
                        },
                        post: {}
                    }
                }
            }
        },

        // Usemin will change html `src` and `href` values based on file revisions (searches for files in the `assetsDirs`).
        // Comments used for uglifying will be removed too
        usemin: {
            html: 'dist/index.html',
            options: {
                assetsDirs: ['dist', 'dist/js', 'dist/css', 'dist/img']
            }
        },

        // Add a banner to minified css and js files
        usebanner: {
            dist: {
                options: {
                    banner: '<%= banner %>'
                },
                files: {
                    src: ['dist/css/<%= pkg.name %>.min.css', 'dist/js/<%= pkg.name %>.min.js']
                }
            }
        },

        // JSHint will check defined files for unused code, undefined variables and other violations of good coding style
        jshint: {
            src: '<%= src %>',
            options: {
                // Load the options from `.jshintrc` instead of setting up a config here
                jshintrc: true,
                // The force option will force JSHint not to throw exceptions, so that the Grunt task chain will continue after the exit of JSHint.
                // If set to `force: false`, JSHint will exit with an exception and Grunt will stop execution of tasks in the current task chain
                force: true
            }
        },

        // CSSLint is the same as JSHint for CSS files
        csslint: {
            src: ['app/css/**/*.css']
        },

        // Karma is a test runner for JavaScript that will execute unit tests and keeps watching for file changes to re-run tests
        karma: {
            watch: {
                configFile: 'test/karma.conf.js'
            },
            continuous: {
                configFile: '<%= karma.watch.configFile %>',
                // Set `singleRun: true` for use with continuous integration server like Jenkins or Travis CI.
                // Prevents Karma from running forever.
                singleRun: true 
            }
        },

        // We need some copy tasks for building up the dist directory on build
        copy: {
            img: {
                expand: true,
                cwd: 'app/',
                src: ['img/**/*', 'favicon.ico'],
                dest: 'dist/'
            },
            html: {
                src: 'app/index.html',
                dest: 'dist/index.html'
            },
            bootstrap: {
                expand: true,
                cwd: 'app/bower_components/bootstrap/dist',
                src: ['fonts/*.*'],
                dest: 'dist/'
            }
        },

        // Add hashes to files for browser caching
        rev: {
            dist: {
                files: {
                    src: [
                        'dist/js/*.js',
                        'dist/css/*.css',
                        'dist/img/**/*',
                        'dist/favicon.ico'
                    ]
                }
            }
        },

        // Simple sync task that synchronizes some important values from `package.json` to `bower.json`
        sync: {
            all: {
                options: {        
                    sync: ['name', 'version']
                }
            }
        },

        // Docker generates html documentation with comments side-by-side with code. Very nice for code reviews and understanding code
        docker: {
            all: {
                src: ['Gruntfile.js', 'app/js/', 'test/'],
                dest: 'docs'
            },
            options: {
                lineNums: true
            }
        },

        // Clean task for e.g. cleaning up docs folder before creating new documentation.
        // This is needed as docker isn't cleaning up the directory itself
        clean: {
            docs: {
                src: ['docs']
            },
            dist: {
                src: ['dist']
            },
            tmp: {
                src: ['.tmp']
            }
        }
    });

    // **Include all dependencies here (possible a wrapper for the 'require' function of node):**
    grunt.loadNpmTasks('grunt-banner');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-csslint');  
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-docker');
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-npm2bower-sync');
    grunt.loadNpmTasks('grunt-rev');
    grunt.loadNpmTasks('grunt-usemin');

    // **Register all the aliases for custom tasks:**

    // Run `server:dev` for a local development server that watches file changes
    grunt.registerTask('server:dev', ['connect:dev', 'watch']);

    // Run `test:dev` for use in development for monitoring file changes and re-run unit tests on each change
    grunt.registerTask('test:dev', ['karma:watch']);
    // Run `test:prebuild` for running a continuous integration test
    grunt.registerTask('test:prebuild', ['karma:continuous']);

    // Run `docs` as alias for docker (clean docs directory first)
    grunt.registerTask('docs', ['clean:docs', 'docker']);

    // **Finally, let's define the `build` task:**

    // The `build` task will create docs and dist folder from sources (default task for Grunt)
    grunt.registerTask('build', ['sync', 'test:prebuild', 'docs', 'clean:dist', 'useminPrepare', 'concat', 'uglify', 'cssmin', 'usebanner', 'copy', 'rev', 'usemin', 'htmlmin', 'clean:tmp']);
    grunt.registerTask('default', ['build']);

    // Run `build` without creating documentation (if Python is not installed e.g.)
    grunt.registerTask('build:nodocs', ['sync', 'test:prebuild', 'clean:dist', 'useminPrepare', 'concat', 'uglify', 'cssmin', 'usebanner', 'copy', 'rev', 'usemin', 'htmlmin', 'clean:tmp']);

    // The `build:server` task will do everything `build` does and start up a server after successful build
    grunt.registerTask('build:server', ['build', 'connect:postbuild']);
};