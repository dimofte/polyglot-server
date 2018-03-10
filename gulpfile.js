'use strict';
const gulp = require('gulp');
const livereload = require('gulp-livereload');
const server = require('gulp-develop-server');

const serverFiles = ['./src/**/*'];

gulp.task('default', ['server:start', 'js:watch', 'css:watch', 'html:watch'], function() {
  function restart(file) {
    server.changed(function(error) {
      if (!error) livereload.changed(file.path);
    });
  }
  gulp.watch(serverFiles).on('change', restart);
});

gulp.task('server', ['server:start'], function() {
  function restart(file) {
    server.changed(function(error) {
      if (!error) livereload.changed(file.path);
    });
  }
  gulp.watch(serverFiles).on('change', restart);
});

gulp.task('server:start', function() {
  process.env.VERBOSE = process.argv.includes('--verbose');
  console.log(`verbose in gulp, ${process.env.VERBOSE}`);

  server.listen(
    {
      path: './src/main.js',
      env: {
        NODE_ENV: 'development',
        VERBOSE: process.argv.includes('--verbose')
      }
    },
    function(err) {
      if (err) {
        return;
      }
      livereload.listen;
    }
  );
});

// legacy code below... it might be handy in the future

gulp.task('html', function() {
  gulp.src('./public/*.html').pipe(livereload());
});

gulp.task('html:watch', function() {
  livereload.listen();
  gulp.watch('./public/*.html', ['html']);
});

gulp.task('css', function() {
  gulp.src('./public/css/**/*.css').pipe(livereload());
});

gulp.task('css:watch', function() {
  livereload.listen();
  gulp.watch('./public/css/**/*.css', ['css']);
});

gulp.task('js', function() {
  gulp.src('./public/js/**/*.js').pipe(livereload());
});

gulp.task('js:watch', function() {
  livereload.listen();
  gulp.watch('./public/js/**/*.js', ['js']);
});
