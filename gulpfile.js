/* eslint-disable node/exports-style */
/* eslint-disable node/no-unpublished-require*/
const { src, dest, watch , parallel} = require('gulp');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const sourcemaps = require('gulp-sourcemaps');
const cssnano = require('gulp-cssnano');
const plumber = require('gulp-plumber');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const notify = require('gulp-notify');
/* eslint-enable node/no-unpublished-require*/

function scss (){
  return src('dev/scss/**/*.scss')
  .pipe(sourcemaps.init())
  .pipe(plumber({
    errorHandler: notify.onError(function(err){
      return{
        title:'scss',
        sound:false,
        message:err.message
      }
    })
  }))
  .pipe(sass())
  .pipe(autoprefixer({cascade: false}))
  .pipe(cssnano())
  .on('error',notify.onError({
    message: "Error: <%= error.message %>",
    title: "stile"
  }))
  .pipe(sourcemaps.write('.'))
  .pipe(dest('public/stylesheets'))
}

function scripts(){
  return src(
    [
      'dev/js/auth.js',
      'dev/js/post.js',
      'dev/js/comment.js'
    ]
  )
  .pipe(sourcemaps.init())
  .pipe(concat('scripts.js'))
 //.pipe(uglify())
  .pipe(sourcemaps.write('.'))
  .pipe(dest('public/javascripts'))
}

// exports.scss = scss;
// exports.scripts = scripts;
exports.default = function(){
  watch('dev/scss/**/*.scss', scss);
  watch('dev/js/**/*.js',scripts);
}
exports.build = parallel(scripts, scss);








