'use strict';
var gulp = require('gulp');
var livereload = require('gulp-livereload');
var server = require( 'gulp-develop-server' );

var serverFiles = [
    './app.js'
];


gulp.task('default', ['server:start', 'js:watch', 'css:watch', 'html:watch'], function(){
  function restart( file ) {
      server.changed( function( error ) {
          if( ! error ) livereload.changed( file.path );
      });
  }
  gulp.watch( serverFiles ).on( 'change', restart );

});
gulp.task('server', ['default']);

gulp.task( 'server:start', function() {
    server.listen( { path: './app.js' }, function(err){
        if(err){return;}
        livereload.listen;
    });
});

gulp.task('html', function() {
  gulp.src('./public/*.html')
    .pipe(livereload());
});

gulp.task('html:watch', function () {
  livereload.listen();
  gulp.watch('./public/*.html', ['html']);
});

gulp.task('css', function() {
  gulp.src('./public/css/**/*.css')
    .pipe(livereload());
});

gulp.task('css:watch', function () {
  livereload.listen();
  gulp.watch('./public/css/**/*.css', ['css']);
});

gulp.task('js', function() {
  gulp.src('./public/js/**/*.js')
    .pipe(livereload());
});

gulp.task('js:watch', function () {
  livereload.listen();
  gulp.watch('./public/js/**/*.js', ['js']);
});
