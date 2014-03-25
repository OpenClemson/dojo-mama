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
		'dojo-mama/layout/responsiveTwoColumn/Layout',
		'app/dmConfig',
		'app/util/dom-utils',
		'dojo/dom-class',
		'dojo/has',
		'dojo/ready',
		'app/util/Dialog',
		'app/util/ProgressIndicator'
	], function (Layout, dmConfig, domUtils, domClass, has, ready, Dialog, ProgressIndicator) {
		ready(function() {

			if (!has('touch')) {
				domClass.add(document.getElementsByTagName('html')[0], 'no_touch');
			}

			var layout = new Layout({config: dmConfig}),
				layoutReady = layout.startup(),
				pi = new ProgressIndicator();

			pi.placeAt(document.body);
			pi.start();

			layoutReady.then(function() {

				// render cufon fonts for Winblows Mobile
				domUtils.cufonify();

				domUtils.injectNavSpinners(layout);

				// stop the progress indicator
				pi.stop();

				// check for cookies
				(function() {
					var cookieEnabled = (navigator.cookieEnabled) ? true : false,
						dialog;
					if (typeof navigator.cookieEnabled == "undefined" && !cookieEnabled) {
						document.cookie="testcookie";
						cookieEnabled = (document.cookie.indexOf("testcookie") != -1) ? true : false;
					}
					if (!cookieEnabled) {
						dialog = new Dialog({
							blocking: true,
							title: 'Please Enable Cookies',
							message: 'It appears that your browser does not have cookies enabled, a requirement for this online application. Please	enable cookies before continuing.',
							'class': 'cookieError'
						});
						dialog.show();
					}
				}());
			});
		});
	});
});
