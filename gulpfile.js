'use strict';
var gulp = require('gulp');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var cleanCSS = require('gulp-clean-css');
var jsdoc = require('gulp-jsdoc3');

gulp.task('sass', function () {
    return gulp.src('./public/scss/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(sourcemaps.write('../maps'))
    .pipe(gulp.dest('./public/scss/css'));
});
gulp.task('sass:watch', function () {
    gulp.watch('./public/scss/*.scss', ['sass']);
});


gulp.task('doc', function (cb) {  //java docs do not need
    gulp.src(['README.md', './src/**/*.js'], {read: false})
        .pipe(jsdoc(cb));
});


gulp.task('default', ['sass', 'sass:watch']);
