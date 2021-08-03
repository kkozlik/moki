const gulp = require('gulp');
const debug = require('gulp-debug');
const babel = require('gulp-babel');

var jsFiles = ['build/**/*.js'];

gulp.task('rm_console', function() {
  return gulp.src(jsFiles)
    .pipe(babel(
      {
        "plugins": [
          "transform-remove-console",
          "@babel/plugin-proposal-class-properties"
        ]
      }
    ))
    .pipe(gulp.dest('build/'));
});
