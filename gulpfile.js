"use strict";

var gulp = require("gulp"),                     // task runner
    jade = require('gulp-jade'),                // compiles .jade files to HTML
    stylus = require('gulp-stylus'),            // compiles .styl files to CSS
    plumber = require("gulp-plumber"),          // prevents pipe breaking caused by errors from gulp plugins
    postcss = require("gulp-postcss"),          // PostCSS gulp plugin to pipe CSS through several plugins, but parse CSS only once
    autoprefixer = require("autoprefixer"),     // prefixes CSS with Autoprefixer
    browserSync = require("browser-sync"),      // keeps multiple browsers & devices in sync when building applications
    reload = browserSync.reload,
    mqpacker = require("css-mqpacker"),         // packes same CSS media query rules into one media query rule
    minify = require("gulp-csso"),              // minifies CSS
    uglify = require('gulp-uglify'),            // minifies JavaScript
    concat = require('gulp-concat'),            // concatenates JS files
    babel = require('gulp-babel'),              // compiles ES6 written JS files to previous version of ES
    imagemin = require("gulp-imagemin"),        // optimize images
    rename = require("gulp-rename"),            // renames files
    run = require("run-sequence"),              // runs a sequence of gulp tasks in the specified order
    del = require("del"),                       // deletes files and folders
    pump = require('pump'),                     // pipes streams together and destroys all of them if one of them closes
    ngAnnotate = require('gulp-ng-annotate');   // adds AngularJS dependency injection annotations (use at minification of JS)

gulp.task("style", function() {
  gulp.src("src/stylus/style.styl")
    .pipe(plumber())
    .pipe(stylus())
    .pipe(postcss([
      autoprefixer({browsers: [
        "last 1 version",
        "last 2 Chrome versions",
        "last 2 Firefox versions",
        "last 2 Opera versions",
        "last 2 Edge versions"
      ]}),
      mqpacker({
        sort: true
      })
    ]))
    .pipe(gulp.dest("build/css"))
    .pipe(minify())
    .pipe(rename("style.min.css"))
    .pipe(gulp.dest("build/css"))
    .pipe(reload({stream: true}));
});

gulp.task("images", function() {
  return gulp.src("build/img/**/*.{png,jpg,gif}")
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.jpegtran({progressive: true})
    ]))
    .pipe(gulp.dest("build/img"));
});
  
gulp.task("serve", function() {
  browserSync({
    server: {
      baseDir: "./build",
      index: "index.html"
    }
  })

  gulp.watch("src/scss/**/*.styl", ["style"]);
  gulp.watch("src/**/*.jade",["html"]);
  gulp.watch("src/js/**/*.js",["script-custom"]);
});

gulp.task("script-lib", function() {
  return gulp.src(['src/js/lib/jquery.min.js',
                  'src/js/lib/lodash.min.js', // library with built-in useful methods
                  'src/js/lib/angular.min.js',
                  'src/js/lib/angular-ui-router.min.js'])
    .pipe(concat('lib.js'))
    .pipe(gulp.dest("build/js"))
    .pipe(uglify())
    .pipe(rename("lib.min.js"))
    .pipe(gulp.dest('build/js'));
});

gulp.task("script-custom", function() {
  return gulp.src(['src/js/main.js',
                  'src/js/services/**/*.js', 
                  'src/js/components/**/*.js'])
    .pipe(concat('main.js'))
    .pipe(babel({
            presets: ['es2015']
        }))
    .pipe(ngAnnotate())
    .pipe(gulp.dest("build/js"))
    .pipe(uglify())
    .pipe(rename("main.min.js"))
    .pipe(gulp.dest('build/js'))
    .pipe(reload({stream:true}));
});

gulp.task("copy", function() {
  return gulp.src(["src/fonts/**/*.{ttf,eot,woff,woff2}",
  								 "src/img/**/*.{png,jpg,jpeg}"], {
      base: "./src/"
    })
    .pipe(gulp.dest("build"));
});

gulp.task("html", function() {
  var YOUR_LOCALS = {};

  return gulp.src("src/**/*.jade")
  .pipe(jade({
    locals: YOUR_LOCALS
  }))
  .pipe(gulp.dest("build"))
  .pipe(reload({stream:true}));
});

gulp.task("clean", function() {
  return del("build");
});

gulp.task("build", function(fn) {
  run(
    "clean",
    "copy",
    "html",
    "images",
    "style",   
    "script-lib",
    "script-custom",
    fn
  );
});