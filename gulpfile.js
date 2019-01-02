var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefxer = require('gulp-autoprefixer');
var cleancss = require('gulp-clean-css');
var concat = require('gulp-concat');
var htmlmin = require('gulp-htmlmin');
var imagemin = require('gulp-imagemin');
var rev = require('gulp-rev');
var collector = require('gulp-rev-collector');
var uglify = require('gulp-uglify');
var webserver = require('gulp-webserver');
var babel = require('gulp-babel');

var fs = require('fs');
var path = require('path');
var url = require('url');

gulp.task('byscss', function() {
    return gulp.src('./src/scss/*.scss')
        .pipe(sass()) //编译

    // .pipe(autoprefixer({
    //     browsers: ['last 2 versions'] //浏览器：['最后两个版本']
    // }))
    // .pipe(concat('all.css')) //合并css

    .pipe(cleancss()) //压缩
        .pipe(gulp.dest('./src/css/'));
});

gulp.task('copycss', function() { //拷贝css
    return gulp.src('./src/css/*.css')
        .pipe(gulp.dest('./dist/css/'));
});

gulp.task('copyjs', function() { //拷贝js
    return gulp.src('./src/js/**/*.js')
        .pipe(concat('all.js')) //合并
        //  (压缩js) //开发时，不建议压缩，建议合并（常用）
        .pipe(babel({
            presets: 'es2015'
        }))
        .pipe(uglify()) //压缩
        .pipe(gulp.dest('./dist/js/'));
});

gulp.task('watch', function() { //实时监听
    return gulp.watch('./src/scss/*.scss', gulp.series('byscss'));
    return gulp.watch('./src/js/**/*.js', gulp.series('bysjs'));
});


gulp.task('htmlmin', function() { // 压缩html
    return gulp.src('./src/*.html')
        .pipe(htmlmin({
            collapseWhitespace: true
        }))
        .pipe(gulp.dest('./dist/'))
});


gulp.task('imagemin', function() { //压缩img
    return gulp.src('./src/img/*.{gif,jpg,png}')
        .pipe(imagemin({
            optimizationLevel: 6
        }))
        .pipe(gulp.dest('./dist/img/'));
});


// // //创建任务(启动服务)
gulp.task('web', function() {
    return gulp.src('src')
        .pipe(webserver({
            port: 8889, //配置端口号
            open: true, //自动打开浏览器
            livereload: true, //自动刷新
            // host: '192.168.0.64', //配置id地址
            // fallback: 'index.html', //指定默认打开的文件
            middleware: function(req, res, next) { //拦截前端请求
                var pathname = url.parse(req.url).pathname; //请求的路径
                if (req.url === '/favicon.ico') {
                    res.end('');
                    return;
                }
                pathname = pathname === '/' ? 'index.html' : pathname; //选择默认主页
                res.end(fs.readFileSync(path.join(__dirname, 'src', pathname))); //返回所要执行的文件（读取）
            }
        }))
});

//创建任务（添加MD5后缀）为了清除缓存
gulp.task('rev', function() {
    return gulp.src('./src/js/*.js')
        .pipe(rev()) //对文件名加MD5后缀
        .pipe(gulp.dest('./src/js'))
        .pipe(rev.manifest())
        .pipe(gulp.dest('./src/rev/'));
});

//创建任务（替换路径index.html里的js）
gulp.task('collector', function() {
    return gulp.src(['./src/rev/*.json', './src/index.html'])
        .pipe(collector({
            replaceReved: true
        }))
        .pipe(gulp.dest('./dist/data/'));
});



gulp.task('dev',
    gulp.series('byscss', 'copycss', 'copyjs', 'htmlmin', 'imagemin', 'web', 'rev', 'collector', 'watch'));