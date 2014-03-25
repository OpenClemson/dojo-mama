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
		'dojo/_base/lang',
		'dojo/Deferred',
		'dojo/request'
], function(declare, lang, Deferred, request) {

	var promises = {};

	return declare([], {

		endpoint: null,

		constructor: function(endpoint) {
			console.log(promises);
			this.endpoint = endpoint;
		},

		load: function() {
			console.log('Load data from ' + this.endpoint);
			if (!promises[this.endpoint]) {

				console.log('Starting request for ' + this.endpoint);

				var d = new Deferred();
				promises[this.endpoint] = d.promise;

				request.get(this.endpoint, {handleAs: 'json'}).then(
					function(response) {
						d.resolve(response);
					},
					function(err) {
						promises[this.endpoint] = null;
						d.reject(err);
					});
			}
			else {
				console.log('Request for ' + this.endpoint + ' already done or in progress');
			}
			return promises[this.endpoint];
		}
	});

});
