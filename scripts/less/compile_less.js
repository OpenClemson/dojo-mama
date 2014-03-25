/*
dojo-mama: a JavaScript framework
Copyright (C) 2014 Clemson University

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
Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA
*/

/*global process*/
var lessTools = require('./less_tools'),
	root = '../src',
	targets = {
		// less target: css output
		'../src/app/resources/less/app.less': '../src/app/resources/css/app.css'
	},
	ignoreDirs = [
		'../src/dojox',
		'../src/dojo',
		'../src/dijit',
		'../src/util'
	],
	run = function() {
		var target;
		for (target in targets) {
			if (targets.hasOwnProperty(target)) {
				lessTools.applyLess(target, targets[target]);
			}
		}
	},
	args = process.argv;

process.on('uncaughtException', function (exception) {
	console.log('Exception:');
	var key;
	for (key in exception) {
		if (exception.hasOwnProperty(key)) {
			console.log('  ' + key + ':', exception[key]);
		}
	}
});

if (args[2] === 'watch') {
	lessTools.watchLess(root, run, ignoreDirs);
}
run();
