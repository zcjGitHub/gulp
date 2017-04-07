'use strict';

var gulp = require('gulp');
var less = require('gulp-less');
var notify = require('gulp-notify');
var plumber = require('gulp-plumber');
var sourcemaps = require('gulp-sourcemaps');
var watchify = require('watchify');
var browserify = require('browserify');
var gutil = require('gulp-util');
var uglify = require('gulp-uglify');
var fs = require('fs');

/*
 *
 * write json
 *
 * */

// 报错抛出提示
var onError = function (err) {
    gutil.log('======= ERROR. ========\n');
    notify.onError("ERROR: " + err.message)(err); // for growl
    gutil.beep();
};

var lessSrc = 'public/less/*.less',
    lessDest = 'public/css';

/*
 *
 *  build less
 *
 */

gulp.task('style', function() {

    gulp.watch('public/less/*.less', {}, function (event) {

        var path = event.path.replace(/\\/g, '/'),
            reg = path.match(/(public\/less(\/\w+)*)?\/([\w]+.less)?$/);

        lessSrc = reg[0];
        gulp.run(['less']);
    });
});

gulp.task('less', function() {

    return gulp.src(lessSrc, {client: './'})
        .pipe(plumber({errorHandler: onError}))
        .pipe(sourcemaps.init())
        .pipe(less())
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(lessDest))
});


gulp.task('js', function() {

    var b = browserify({
        entries: ['public/js/index.js'],
        cache: {},
        packageCache: {},
        plugin: [watchify]
    });

    function bundle() {
        b.bundle().pipe(fs.createWriteStream('public/js/bundle.js'));
    }

    b.on('update', bundle);

    bundle();

    b.on('log', function (msg) {
        console.log(msg);
    })
});

gulp.task('min', function() {

    return gulp.src('public/js/bundle.js')
        .pipe(uglify())
        .pipe(gulp.dest('public/js/min'));
});



gulp.task('default', ['style', 'js']);
gulp.task('build', ['min']);

