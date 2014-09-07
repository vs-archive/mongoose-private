'use strict';

var gulp = require('gulp');

var jshint = require('gulp-jshint');

gulp.task('lint', function () {
  return gulp
    .src(['/lib/*.js'])
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jshint.reporter('fail'));
});

gulp.task('default', ['lint']);