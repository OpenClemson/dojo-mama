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

/*global Cufon*/
define(['dojo/_base/declare',
		'dojo/_base/lang'
], function(declare, lang) {

	// module:
	//     app/util/geo-utils

	var GeoUtils = declare([], {

		// id: int
		//     Ids to be return by 
		id: null,

		startup: function() {
			// summary:
			//     Dynamic shim for geolocation
			// tags:
			//     public

			if (navigator.geolocation &&
				navigator.geolocation.getCurrentPosition &&
				!navigator.geolocation.watchPosition) {

				navigator.geolocation.watchPosition = function(success, error, options) {
					// shim watch position using getCurrentPosition
					var id, poll;
					poll = function(successMethod, errorMethod, optionsObj) {
						navigator.geolocation.getCurrentPosition(successMethod, errorMethod, optionsObj);
					};
					id = setInterval(lang.partial(poll, success, error, options), 1000);
					return id;
				};

				navigator.geolocation.clearWatch = function(id) {
					clearInterval(id);
				};
			}

	}});

	return new GeoUtils();
});
