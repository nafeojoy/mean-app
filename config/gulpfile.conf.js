// ```
// gulpfile.conf.js
// (c) 2016 David Newman
// david.r.niciforovic@gmail.com
// gulpfile.conf.js may be freely distributed under the MIT license
// ```

// *gulpfile.js*

// Import gulp packages
import gulp from 'gulp';
import gutil from 'gulp-util';
import rename from 'gulp-rename';
import nodemon from 'gulp-nodemon';
import docco from 'gulp-docco';
import scsslint from 'gulp-scss-lint';
import path from 'path';
import del from 'del';
import globby from 'globby';
import pm2 from 'pm2';

// Define `JavaScript` files to watch/ignore
let jsGlob = ['**/*.js', '!{node_modules,node_modules/**}', '!{docs,doc/**}',
  '!{dist,dist/**}', '!{coverage,coverage/**}', '!src/{res,res/**}',
  '!config/env.conf.js'];

// Define `TypeScript` files to watch/ignore
let tsGlob = ['**/*.ts', '!{node_modules,node_modules/**}', '!{docs,doc/**}',
  '!{dist,dist/**}', '!{coverage,coverage/**}', '!src/{res,res/**}'];

// Define `Sass` files to watch/ignore
let scssGlob = ['**/*.scss', '!{node_modules,node_modules/**}',
  '!{dist,dist/**}', '!{docs,doc/**}', '!{coverage,coverage/**}', '!src/{res,res/**}'];

// Create the default task and have it clear out all existing
// documentation; watch all neccessary files for automatic
// documentation generation as well as linting all `sass` styles.
gulp.task('default', ['clean:docs',
  'watch:docs',
  'watch:sass']);

// Watch `Sass` files for changes and lint
gulp.task('watch:sass', () => {

  gulp.watch(scssGlob, function (event) {
    return gulp.src(event.path)
      .pipe(scsslint());
  });
});

gulp.task('build:docs', () => {

  // Take a file `glob` pattern and a file extension matching
  // the extension of the files you are trying to generate
  // documentation for
  function generateDocs(fileSrc, ext) {

    console.log(ext);

    if (ext == '') {

      throw new Error('Extension must be passed in for documentation to be generated properly!')
    }
    return gulp.src(fileSrc)
      .pipe(docco())
      .pipe(gulp.dest(`docs/${ext}`));
  }

  generateDocs(jsGlob, '.js');

  generateDocs(tsGlob, '.ts');

  generateDocs(scssGlob, '.scss');

});

// Create documentation for Javascript, Typescript, and Sass files
// on the fly
gulp.task('watch:docs', () => {

  // For `gulp-docco` if the need arises
  //  Default configuration options. All of these may be extended by user-specified options.
  //
  //  defaults =
  //    layout:     'parallel'
  //    output:     'docs'
  //    template:   null
  //    css:        null
  //    extension:  null
  //    languages:  {}
  //    marked:     null
  //
  //  Example:
  //
  //  let docco = require("gulp-docco");
  //
  //  gulp.src("./src/*.js")
  //    .pipe(docco(options))
  //    .pipe(gulp.dest('./documentation-output'))
  //
  // Reference: https://www.npmjs.com/package/gulp-docco
  //  Also see: https://jashkenas.github.io/docco/
  //
  let options = {
    layout: 'parallel',
    output: 'docs',
    template: null,
    css: null,
    extension: null,
    languages: {},
    marked: null
  }

  // Alert the user whenever changes have been detected and documentation
  // generation is occurring
  function generateUserAlert(ext) {

    switch (ext) {

      case '.js':
        console.log('A JavaScript file has changed; documentation will now be generated...');

        break;

      case '.scss':
        console.log('A Sass file has changed; documentation will now be generated...');

        break;

      case '.ts':
        console.log('A TypeScript file has changed; documentation will now be generated...');

        break;

      default:
        console.log('Generating appropriate folders and styles...');

        break;
    }

    return;
  }

  // Watch files specified and generate the documentation
  // whenever changes are detected.
  function generateDocs(fileSrc) {
    gulp.watch(fileSrc, function (event, ext = path.extname(event.path)) {

      generateUserAlert(ext);

      // Ignore docs, bower_components and node_modules
      return gulp.src(fileSrc)
        .pipe(docco())
        .pipe(gulp.dest(`docs/${ext}`))
        .on('error', gutil.log);
    });
  }

  // Generate documentation for files specified in `glob` vars at top
  // of file
  generateDocs(jsGlob);

  generateDocs(tsGlob);

  generateDocs(scssGlob);
});

// Sugar for `gulp serve:watch`
gulp.task('serve', ['serve:watch']);
gulp.task('serve:mobile', ['serve:watch:mobile']);
gulp.task('serve:admin', ['serve:watch:admin']);

gulp.task('serve:live', ['serve:watch:live']);
gulp.task('serve:admin:live', ['serve:watch:admin:live']);
gulp.task('serve:mobile:live', ['serve:watch:mobile:live']);
// Configure gulp-nodemon
// This watches the files belonging to the app for changes
// and restarts the server whenever a change is detected
gulp.task('serve:watch', () => {
  process.env.MODULE = 'public';
  nodemon({
    script: 'server.js',
    ext: 'js',
    ignore: [
      ".git",
      "node_modules",
      "dist-admin",
      "dist-mobile",
      "src",
      "compiled",
      "config",
      ".vs",
      "dll",
      "sass",
      "server-resource",
      "public",
      "compiled",
      "mobile",
      "test",
      "uploads"
    ]
  });
});

gulp.task('serve:watch:live', function () {
  process.env.MODULE = 'public';
  pm2.connect(true, function () {
    pm2.start({
      name: 'public',
      script: 'server.js',
    }, function () {
      pm2.streamLogs('all', 1);
      setTimeout(() => {
        process.exit(0);
      }, 5000)
    });
  });
});

gulp.task('serve:watch:mobile', () => {
  process.env.MODULE = 'mobile';
  nodemon({
    script: 'server.js',
    ext: 'js',
    ignore: [
      ".git",
      "node_modules",
      "dist-admin",
      "dist-mobile",
      "src",
      "compiled",
      "config",
      ".vs",
      "dll",
      "sass",
      "server-resource",
      "public",
      "compiled",
      "mobile",
      "test",
      "uploads"
    ]
  });
});

gulp.task('serve:watch:admin', () => {
  process.env.MODULE = 'admin';
  nodemon({
    script: 'server.js',
    ext: 'js',
    ignore: [
      ".git",
      "src",
      "node_modules",
      "dist-public",
      "dist-mobile",
      "compiled",
      // "config",
      ".vs",
      "dll",
      "sass",
      "server-resource",
      "public",
      "mobile",
      "dll",
      "test",
      "uploads"
    ]
  });
});

gulp.task('serve:watch:admin:live', function () {
  process.env.MODULE = 'admin';
  pm2.connect(true, function () {
    pm2.start({
      name: 'admin',
      script: 'server.js'
    }, function () {
      pm2.streamLogs('all', 0);
      setTimeout(() => {
        process.exit(0);
      }, 5000)
    });
  });
});

gulp.task('serve:watch:mobile:live', function () {
  process.env.MODULE = 'mobile';
  pm2.connect(true, function () {
    pm2.start({
      name: 'mobile',
      script: 'server.js'
    }, function () {
      pm2.streamLogs('all', 2);
      setTimeout(() => {
        process.exit(0);
      }, 5000)
    });
  });
});


// Use the 'del' module to clear all traces of documentation
// Useful before regenerating documentation
// Not currently working due to a globbing issue
// See: https://github.com/sindresorhus/del/issues/50
gulp.task('clean:docs', (callback) => {
  del(['./docs/**/*']).then(function (paths) {
    callback(); // ok
  }, function (reason) {
    callback('Failed to delete files: ' + reason); // fail
  });
});

