/*
dojo-mama: a JavaScript framework
Copyright (C) 2015 Omnibond Systems, LLC

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

define(['dojo/_base/declare',
		'dojo/Deferred',
		'dojo/request/xhr',
		'app/util/toaster'
], function(declare, Deferred, xhr, toaster) {

	var versionUrl = '/version.json';
	var updateWarning = 'There has been an update to my.Clemson. ' +
		'<strong><a href="#" onclick="window.location.reload(true);return false;">Click here to refresh the app</a>.</strong>';

	var UpdateUtilities = declare([], {

		checkForUpdate: function(ignoreUpdates) {
			// summary:
			//    Check for updates to the application
			//    and show a message if one is detected.
			//    returns a deferred that resolves after the check.
			//    If an update is detected, the deferred will
			//    resolve with true. If no update is detected,
			//    the deferred will resolve with false.
			// ignoreUpdates:
			//    If truthy, do not show the refresh dialog

			console.log('Application update check');

			var version = window.VERSION,
				d = new Deferred();

			// Check to see if there was an update
			xhr.get(versionUrl, {
				handleAs: 'json',
				preventCache: true,
				timeout: 3
			}).then(
				function(response) {
					console.log('Latest version: ', response);
					if (response.branch === version.branch &&
						response.revision === version.revision &&
						response.tier === version.tier)
					{
						d.resolve(false);
						return;
					}
					// update detected
					if (!ignoreUpdates) {
						toaster.displayMessage({
							text: updateWarning,
							type: 'warning',
							time: -1
						});
					}
					d.resolve(true);
				},
				function(err) {
					console.error('Application update check error');
					console.error(err);
					// error is likely due to network connection
					d.resolve(false);
				}
			);
			// return the deferred
			return d;
		}
	});
	// singleton
	return new UpdateUtilities();
});
