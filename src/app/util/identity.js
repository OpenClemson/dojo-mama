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

define([
		'dojo/_base/kernel',
		'dojo/Deferred',
		'dojo/request/xhr'
], function (kernel, Deferred, xhr) {

	// module:
	//     app/identity

	var authServiceUrl,
		loginRedirect,
		xhrOptions;

	authServiceUrl = 'srv/auth/getUserInfo.php';
	loginRedirect = 'srv/auth/authenticate.php';
	xhrOptions = {
		preventCache: true,
		handleAs: 'json',
		timeout: kernel.global.dmConfig.networkTimeout
	};

	return {
		// description:
		//     The identity library checks authentication of a user.

		getUser: function (/*Boolean?*/ forceLogin) {
			// summary:
			//     Gets a user's identity information. 
			// forceLogin:
			//     If force is true, forces the user to log in.

			var dfd = new Deferred(),
				options = xhrOptions;

			xhr.get(authServiceUrl, xhrOptions).then(
				function(data) {
					var url;
					if (!(data && typeof data.authenticated === 'boolean')) {
						console.error('Unexpected authentication response', data);
						dfd.reject(data);
						return;
					}
					if (forceLogin && !data.authenticated) {
						url = encodeURIComponent(window.location.href);
						window.location.href = loginRedirect + '?url=' + url;
						return;
					}
					dfd.resolve(data);
				},
				function(err) {
					console.error('Authentication error');
					dfd.reject(err);
				}
			);

			return dfd;
		}

	};
});
