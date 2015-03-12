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
 * This file is the application's main JavaScript file. It is listed as a dependency in run.js and will automatically
 * load when run.js loads.
 *
 * Because this file has the special filename `main.js`, and because we've registered the `app` package in run.js,
 * whatever object this module returns can be loaded by other files simply by requiring `app` (instead of `app/main`).
 *
 */
define(['require'], function (require) {
	require([
		/* Additional dependencies here should also be added to the base profile to minimize initial requests. */
		'dojo/ready',
		'app/dmConfig',
		'app/layout/layout',
		'dojo-mama/ModuleManager'
	], function (
		ready, dmConfig, layout, ModuleManager
	) {
		ready(function() {
			var moduleManager;
			layout.startup();
			moduleManager = new ModuleManager({
				config: dmConfig
			});
			moduleManager.startup();
		});
	});
});
