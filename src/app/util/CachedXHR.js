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
		'dojo/_base/array',
		'dojo/_base/kernel',
		'dojo/_base/lang',
		'dojo/Deferred',
		'dojo/io-query',
		'dojo/request/xhr',
		'dojo/date/stamp'
], function(declare, array, kernel, lang, Deferred, ioQuery, xhr, stamp) {

	var CachedXHR = declare([], {

		_cachedUrls: null,
		_cacheData: null,
		_cacheSize: null,
		_cacheExpiration: null,

		_maxCacheSize: 10000,

		_promises: null,

		log: function() {
			console.log('---------------------------');
			console.log('XHR Cache at ' + (new Date()));
			console.log('URLs cached');
			console.log(this._cachedUrls);
			console.log('Data');
			console.log(this._cacheData);
			console.log('Sizes');
			console.log(this._cacheSize);
			console.log('Expirations');
			console.log(this._cacheExpiration);
			console.log('Promises');
			console.log(this._promises);
			console.log('---------------------------');
		},

		constructor: function() {
			this.inherited(arguments);

			this._cachedUrls = [];
			this._cacheData = {};
			this._cacheSize = {};
			this._cacheExpiration = {};

			this._promises = {};
		},

		cacheSize: function() {
			var total = 0;
			var i;
			for (i = 0; i < this._cachedUrls.length; i++) {
				total += this._cacheSize[this._cachedUrls[i]];
			}
			return total;
		},

		isCacheDataExpired: function(url) {
			if (!this.hasCacheData(url)) {
				return null;
			}
			var now = new Date();
			return now.getTime() > this._cacheExpiration[url];
		},

		hasCacheData: function(url) {
			return (array.indexOf(this._cachedUrls, url) !== -1);
		},

		calculateObjectSize: function(object) {
			var objectList = [];
			var stack = [ object ];
			var bytes = 0;
			var i;
			var value;

			while (stack.length) {
				value = stack.pop();


				if (typeof value === 'boolean') {
					bytes += 4;
				}
				else if (typeof value === 'string') {
					bytes += value.length * 2;
				}
				else if (typeof value === 'number') {
					bytes += 8;
				}
				else if (typeof value === 'object' && array.indexOf(objectList, value) === -1) {
					objectList.push(value);

					for (i in value) {
						if (value.hasOwnProperty(i)) {
							stack.push(value[i]);
						}
					}
				}
			}
			return bytes;
		},

		cacheData: function(url, data, expiration, size) {
			console.log('Cache data for ' + url);
			this.clearCachedData(url);
			this._cacheData[url] = data;
			this._cacheSize[url] = size || this.calculateObjectSize(data);
			var now = new Date();
			this._cacheExpiration[url] = expiration || (now.getTime() + 60000);
			this._cachedUrls.push(url);

			console.log('Total cache size: ' + this.cacheSize());
		},

		clearCachedData: function(url) {
			console.log('Clear cached data for ' + url);

			if (!this.hasCacheData(url)) {
				return false;
			}

			this._cachedUrls.splice(array.indexOf(this._cachedUrls, url), 1);

			delete this._cacheData[url];
			delete this._cacheSize[url];
			delete this._cacheExpiration[url];

			return true;
		},

		get: function(url, options) {
			var d = new Deferred();

			console.log('Get data for ' + url);

			var originalUrl = url;

			// Append query string to url
			if (options && options.query) {
				var query = ioQuery.objectToQuery(options.query);
				url += (url.indexOf('?') != -1 ? '&' : '?') + query;
			}

			// If fresh data is cached for this URL, return a promise resolved
			// with that data
			if (this.hasCacheData(url) && !this.isCacheDataExpired(url)) {
				console.log('Returning cached data');
				d.resolve(this._cacheData[url]);
				return d.promise;
			}

			// If there already exists a promise for this URL, return it
			// This means another call to this function has requested the URL and we're still
			// in the process of loading it from that call
			if (this._promises[url]) {
				console.log('URL is currently loading. Returning existing promise');
				return this._promises[url];
			}

			// Otherwise, (there is no valid cached data and there's not another pending request
			// for this URL) start a request for this URL
			this._promises[url] = d.promise;

			// Ignore browser cache since we're handling it here
			var opts = lang.mixin({
				preventCache: true,
				handleAs: 'json',
				timeout: kernel.global.dmConfig.networkTimeout
			}, options);

			console.log('No cache, load URL');

			xhr.get(originalUrl, opts).then(
				lang.hitch(this, function(response) {

					console.log('XHR cache received data for ' + url);
					console.log(response);

					var data = null;
					if (response.expiration && response.data) {
						data = response.data;
						var expiration = stamp.fromISOString(response.expiration);
						this.cacheData(url, response.data, expiration, response.size);
					}
					else {
						console.warn('Object requested through xhr does not have a expiration set');
						data = response;
						this.cacheData(url, response);
					}



					this.log();

					// Delete promise since this URL is not in the process of loading
					delete this._promises[url];

					// Pass data to handler
					d.resolve(data);
				}),
				lang.hitch(this, function(err) {

					console.log('XHR cache error fetching data for ' + url);
					console.log(err);

					// Delete promise since this URL is not in the process of loading
					delete this._promises[url];

					// Pass error to handler
					d.reject(err);
				}));

			return d.promise;
		}
	});

	return new CachedXHR();
});
