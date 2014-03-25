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

define(['dojo/_base/declare',
		'dojo/_base/kernel',
		'dojo/topic',
		'dojo-mama/util/toaster'
], function(declare, kernel, topic, toaster) {

	var ErrorUtilities = declare([], {

		handleNetworkError: function(/*Object*/ err, /*Object?*/ ignore404) {
			// summary:
			//    Handle network errors
			// err:
			//    A network error object (e.g. XHR errback parameter)
			// ignore404:
			//    If truthy, do not route to 404 when err.response.status === 404


			console.warn('Network error', err);

			if (err.response && err.response.status === 404 && !ignore404) {
				topic.publish('/dojo-mama/show404');
				return;
			}
			var text = kernel.global.dmConfig.networkErrorMessage;
			if (err.response && err.response.status) {
				text += ' (' + err.response.status + ')';
			}
			toaster.displayMessage({
				text: text,
				type: 'error',
				time: -1
			});
		}

	});

	return new ErrorUtilities();
});
