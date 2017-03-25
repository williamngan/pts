var gulp = require("gulp");
var ts = require("gulp-typescript");
const babel = require('gulp-babel');


var tsProject = ts.createProject('tsconfig.json');

gulp.task("default", function () {
    var tsResult = gulp.src("src/app.ts")
        .pipe( tsProject() );
    return tsResult.js.pipe(gulp.dest("./es6"));
});


gulp.task('es5', () =>
	gulp.src('es6/app.js')
		.pipe(babel({
			presets: ['es2015']
		}))
		.pipe(gulp.dest('dist'))
);