/// <reference path="typings/node/node.d.ts"/>
(function () {
    'use strict';
    
    var gulp = require('gulp');
    var args = require('yargs').argv;
    var $ = require('gulp-load-plugins')({ lazy: true });
    var config = require('./gulp.config')();
    var browserSync = require('browser-sync');
    var babel = require('gulp-babel');
    var del = require('del');
    var port = process.env.PORT || config.defaultPort;

    gulp.task('code-quality', function () {
        return gulp.src(config.alljs)
            .pipe($.if(args.verbose, $.print()))
            .pipe($.jscs())
            .pipe($.jshint())
            .pipe($.jshint.reporter('jshint-stylish', { verbose: true }))
            .pipe($.jshint.reporter('fail'));
    });
    
    gulp.task('del', function(){
        return del(['dist']);
    });
    
    gulp.task('babel', function () {
        return gulp.src(config.specs)
            .pipe(babel())
            .pipe(gulp.dest('dist'));
    });
    
    gulp.task('polyfill', function () {
        return gulp.src(config.polyfill)
            .pipe(gulp.dest('dist'));
    });

    gulp.task('serve', function () {
        var nodeOptions = {
            script: config.nodeServer,
            delayTime: 1,
            env: {
                PORT: port,
                NODE_ENV: 'dev'
            },
            watch: [config.server]
        };

        return $.nodemon(nodeOptions)
            .on('restart', ['del', 'polyfill', 'babel', 'code-quality'], function () {
                console.log('*** nodemon restarting ***');
                setTimeout(function () {
                    browserSync.notify('broweser-sync reloading');
                    browserSync.reload({ stream: false });
                }, 1000);
            })
            .on('start', ['del', 'polyfill', 'babel', 'code-quality'], function () {
                console.log('*** nodemon starting ***');
                startBrowserSync();
            });
    });
    
    gulp.task('auto-quality-check', function () {
        gulp.watch(config.alljs, ['code-quality']);
    });

    function startBrowserSync(params) {
        if (args.nosync || browserSync.active) {
            return;
        }

        console.log('*** Starting browser-sync on port: ' + port);

        var options = {
            files: [
                './src/client/**/*.*',
                './spec/**/*.js'
            ],
            proxy: 'localhost:' + port,
            port: 3000,
            ghostMode: {
                clicks: true,
                forms: false,
                location: false,
                scroll: true
            },
            injectChanges: true,
            logFileChanges: true,
            logLevel: 'debug',
            notify: true,
            reloadDelay: 0
        };

        browserSync(options);
    }
})();
