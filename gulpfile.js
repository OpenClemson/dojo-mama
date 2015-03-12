/*
dojo-mama: a JavaScript framework
Copyright (C) 2015 Clemson University

This library is free software; you can redistribute it and/or
modify it under the terms of the GNU Lesser General Public
License as published by the Free Software Foundation; either
version 2.1 of the License, or (at your option) any later version.

This library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public
License along with this library; if not, write to the Free Software
Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA
*/

/**
 * This gulpfile manages tasks to download project dependencies, compile
 * resources, and build the app. Commands accept an optional
 * `--production` parameter to build an optimized version without built-in
 * debugging features.
 *
 * Common commands:
 *
 *    To install project dependencies and compile resources:
 *
 *       $ gulp install
 *
 *    To compile resources (LESS, SASS, Jade, etc):
 *
 *       $ gulp resources
 *
 *    To compile resources and watch for changes with automatic linting:
 *
 *       $ gulp
 *
 *    To create a dev build:
 *
 *       $ gulp build
 *
 *    To create a production build:
 *
 *       $ gulp build --production
 *
 */

var
	// plugins
	argv = require('yargs').argv,
	bowerFiles = require('main-bower-files'),
	concat = require('gulp-concat'),
	debug = require('gulp-debug'),
	del = require('del'),
	exec = require('child_process').exec,
	fs = require('fs'),
	gulp = require('gulp'),
	gulpif = require('gulp-if'),
	gutil = require('gulp-util'),
	ignore = require('gulp-ignore'),
	insert = require('gulp-insert'),
	jade = require('gulp-jade'),
	jshint = require('gulp-jshint'),
	less = require('gulp-less'),
	minifyCSS = require('gulp-minify-css'),
	minifyHTML = require('gulp-minify-html'),
	phplint = require('phplint'),
	plumber = require('gulp-plumber'),
	prefix = require('gulp-autoprefixer'),
	rename = require('gulp-rename'),
	runSequence = require('run-sequence'),
	scss = require('gulp-sass'),
	streamqueue = require('streamqueue'),
	uglify = require('gulp-uglify'),
	// module config
	dmConfig = require('./src/app/dmConfig.js'),
	// task configuration
	config;

config = {
	build: argv.build ? true : false,
	debug: argv.debug ? true : false,
	development: argv.production ? false : true,
	production: argv.production ? true : false,
	tier: argv.production ? 'production' : 'development'
};

config.paths = {
	dist: 'dist/' + config.tier,
	js: [
		'*.js',
		'src/app/**/*.js',
		'src/dojo-mama/**/*.js'
	]
};

gulp.task('build-copy', ['clean'], function() {
	return gulp.src([
		'src/favicon.ico',
		'src/vendor.js',  // bower JS
		'src/srv/**',  // backend services
		'src/**/.htaccess',  // all htaccess files
		'!src/srv/composer.*'  // ignore composer config files
	], {base: 'src'})
	.pipe(gulp.dest(config.paths.dist));
});

gulp.task('build-dojo', ['build-copy', 'build-profile'], function(cb) {
	var loader = 'src/app/run.js',
		profile = 'profiles/' + config.tier + '.profile.js',
		cmd = 'node src/dojo/dojo.js load=build --require ' + loader + ' --profile ' + profile + ' --releaseDir ../' + config.paths.dist;
	exec(cmd, function(err, stdout, stderr) {
		if (config.debug || (err !== null && stdout)) {
			console.log(stdout);
		}
		return cb(err);
	});
});

gulp.task('build-profile', function() {
	// read dmConfig, create build layers for each module
	var modules = dmConfig.modules,
		m, mid, script='', mids={};
	for (m in modules) {
		if (modules.hasOwnProperty(m)) {
			mid = modules[m].moduleId;
			if (mid && !mids[mid]) {
				// script += 'profile.layers["' + mid + '"] = {};\n';
				script += 'profile.layers["dojo/dojo"].include.push("' + mid + '");\n';
				mids[mid] = true;
			}
		}
	}
	if (config.development) {
		// don't strip console messages
		script += "profile.stripConsole = 'none';\n";
		// use source maps
		script += "profile.useSourceMaps = '1';\n";
		// don't optimize anything
		script += "profile.optimize = '';\n";
		script += "profile.layerOptimize = '';\n";
	}
	return gulp.src('profiles/base.profile.js')
		.pipe(insert.append(script))
		.pipe(rename(config.tier + '.profile.js'))
		.pipe(gulp.dest('profiles'));
});

gulp.task('clean', function(cb) {
	del([config.paths.dist], cb);
});

gulp.task('composer', function(cb) {
	exec('cd src/srv && composer install', function(err, stdout, stderr) {
		if (err !== null) {
			var msg =
				'Composer Error\n' +
				'You may download it with:\n' +
				'  $ curl -sS https://getcomposer.org/installer | php\n' +
				'Make composer availabe in your path, e.g.:\n' +
				'  $ mv composer.phar /usr/local/bin/composer\n' +
				'And make it executable, e.g.:\n' +
				'  $ chmod +x /usr/local/bin/composer';
			gutil.log(gutil.colors.red(msg));
		}
		return cb(err);
	});
});

gulp.task('css', function() {
	var stream = streamqueue({objectMode: true});
	stream.on('error', gutil.log);
	stream.queue(gulp.src(['src/app/resources/less/app.less'])
		.pipe(less({
			sourceMap: config.development ? true : false
		}).on('error', gutil.log))
	);
	stream.queue(gulp.src(['src/app/resources/grid/grid-layout.scss'])
		.pipe(scss({errLogToConsole: true}))
	);
	return stream.done()
		.pipe(concat('app.css'))
		.pipe(gulpif(config.production, minifyCSS({processImport: true})))
		.pipe(plumber()) // fixes hanging error
		.pipe(prefix('last 2 versions', '> 1%', 'Android 4')).on('error', gutil.log)
		.pipe(gulp.dest('src/app/resources/css'));
});

gulp.task('dojo-dependencies', function() {
	// copy dojo dependencies
	return gulp.src([
			'bower_components/dojo/**',
			'bower_components/dojox/**',
			'bower_components/dijit/**',
			'bower_components/util/**'
		], { base: 'bower_components' })
		.pipe(gulp.dest('src'));
});

gulp.task('jade', function() {
	return gulp.src(['src/app/resources/jade/index.jade'])
		.pipe(jade({
			pretty: config.development,
			locals: {
				development: config.development,
				production: config.production,
				build: config.build
			}
		})).on('error', gutil.log)
		.pipe(gulpif(config.production, minifyHTML({conditionals: true})))
		.pipe(gulp.dest(config.build ? config.paths.dist : 'src'));
});

gulp.task('jade-templates', function() {
	return gulp.src(['src/app/**/*.jade', '!src/app/resources/jade/**/*.jade'])
		.pipe(jade({
			pretty: config.development,
			locals: {
				development: config.development,
				production: config.production,
				build: config.build
			}
		})).on('error', gutil.log)
		.pipe(gulpif(config.production, minifyHTML({conditionals: true})))
		.pipe(gulp.dest('src/app'));
});

gulp.task('jshint', function() {
	return gulp.src(config.paths.js)
		.pipe(jshint())
		.pipe(jshint.reporter('jshint-stylish'))
		.pipe(jshint.reporter('fail'));
});

gulp.task('phplint', function() {
	return phplint(['src/srv/**/*.php', '!src/srv/vendor/**']);
});

gulp.task('post-build-clean', function(cb) {
	if (config.development) {
		return cb();
	}
	del([
		config.paths.dist + '/**/*.js.consoleStripped.js',
		config.paths.dist + '/**/*.js.uncompressed.js'
	], cb);
});

gulp.task('release-bundle', ['post-build-clean'], function(cb) {
	// tar up the build
	var cmd = 'cp -r ' + config.paths.dist + ' dist/app-build && ' +
		'tar -cz -C dist -f release.tar.gz app-build';
	exec(cmd, function(err, stdout, stderr) {
		if (err !== null && stdout) {
			console.log(stdout);
		}
		return cb(err);
	});
});

gulp.task('release', ['release-bundle'], function(cb) {
	// clean up after the release
	del([
		'dist/app-build/**'
	], cb);
});

gulp.task('vendor-js', function() {
	// create vendor.js from bower files and static js
	var files = bowerFiles();
	gulp.src(files)
		.pipe(concat('vendor.js'))
		.pipe(gulpif(!config.debug, uglify()))
		.pipe(gulp.dest('src'));
});

gulp.task('watch', ['resources'], function() {
	gulp.watch([
		'src/app/resources/less/**/*.less',
		'src/app/resources/grid/**/*.scss'
	], ['css']);
	gulp.watch(['src/app/resources/jade/**/*.jade'], ['jade']);
	gulp.watch(['src/app/**/*.jade'], ['jade-templates']);
	gulp.watch(config.paths.js, ['jshint']);
});

// combined tasks

gulp.task('default', ['watch']);
gulp.task('dependencies', ['vendor-js', 'dojo-dependencies', 'composer']);
gulp.task('lint', ['jshint', 'phplint']);
gulp.task('resources', ['css', 'jade', 'jade-templates']);

gulp.task('install', function(cb) {
	runSequence('dependencies', 'resources', cb);
});

gulp.task('build', function(cb) {
	config.build = true;
	runSequence(['css', 'lint'], 'build-dojo', ['jade', 'jade-templates'], cb); 
});


gutil.log(gutil.colors.underline('Tier: ' + config.tier));
