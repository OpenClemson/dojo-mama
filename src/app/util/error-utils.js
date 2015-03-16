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
		'dojo/_base/kernel',
		'dojo/_base/lang',
		'dojo/topic',
		'app/layout/layout',
		'app/util/toaster',
		'app/util/update-utils'
], function(declare, kernel, lang, topic, layout, toaster, updateUtils) {

	var ErrorUtilities = declare([], {

		handleNetworkError: function(/*Object*/ err, /*Object?*/ ignore404) {
			// summary:
			//    Handle network errors
			// err:
			//    A network error object (e.g. XHR errback parameter)
			// ignore404:
			//    If truthy, do not route to 404 when err.response.status === 404


			console.warn('Network error', err);

			// ignore canceled xhr requests
			if (err.dojoType === 'cancel') {
				return;
			}

			var version = window.VERSION;

			var handleError = lang.hitch(this, function(update) {
				var text = '', defaultText;
				// if there was an update, ignore the error
				if (update) {
					return;
				}
				defaultText = kernel.global.dmConfig.networkErrorMessage;

				if (err.response) {
					if(err.response.text){
						text = err.response.text;
					}else{
						text = defaultText;
					}

					if (err.response.status === 404 && !ignore404) {
						layout.show404();
						return;
					}
					
					if (err.response.status === 403) {
						text = err.response.text || 'Authorization required';
					}
				}
				if (err.response && err.response.status) {
					text += ' (' + err.response.status + ')';
				}
				text += "<br><br><a href='#' onclick='window.location.reload(true);return false;' class='networkErrorRetry'>Retry</a>";
				toaster.displayMessage({
					text: text,
					type: 'error',
					time: -1
				});

			});

			// Check to see if there was an update
			updateUtils.checkForUpdate().then(handleError /*, this deferred is always resolved */);
		},

		clearErrors: function() {
			toaster.clearMessages();
		}

	});

	return new ErrorUtilities();
});
