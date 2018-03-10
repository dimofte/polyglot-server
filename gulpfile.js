'use strict';
const gulp = require('gulp');
const livereload = require('gulp-livereload');
const server = require('gulp-develop-server');

const serverFiles = ['./src/**/*'];

gulp.task('server', ['server:start'], function() {
  function restart(file) {
    server.changed(function(error) {
      if (!error) livereload.changed(file.path);
    });
  }
  gulp.watch(serverFiles).on('change', restart);
});

gulp.task('server:start', function() {
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
