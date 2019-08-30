var gulp = require('gulp')
var babel = require('gulp-babel')
var watch = require('gulp-watch')

gulp.task('babeljs', function () {
  return gulp.src('server/*.js') // 输入目录
    .pipe(babel())
    .pipe(gulp.dest('dist/')) // 输出目录
})
gulp.task('watch', function () { // 实时监听
  gulp.watch('server/*.js', ['babeljs'])
})

gulp.task('default', ['watch', 'babeljs'])
