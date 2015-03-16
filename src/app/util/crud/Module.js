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
		'dojo/_base/lang',
		'dojo/json',
		'dojo/Deferred',
		'dojo/request/xhr',
		'dojo/topic',
		'app/layout/Module',
		'app/util/crud/Parser',
		'app/util/crud/DisplayView',
		'app/util/crud/CreateView',
		'app/util/crud/EditView',
		'app/util/crud/ListView',
		'app/util/error-utils',
		'app/util/identity'
], function(declare, lang, json, Deferred, xhr, topic, Module,
		Parser, DisplayView, CreateView, EditView, ListView, errorUtils, identity) {
	
	// module:
	//     app/util/crud/Module

	return declare([Module], {
		// summary:
		//     The base CRUD module

		// _data: Object
		//     Metadata that drives CRUD functionality
		_data: null,
		// _getIdentity: Function
		//     The app/util/identity getUser deferred
		_getIdentity: null,
		// _identity: Object
		//     A cache of the user's identity returned by app/util/identity
		_identity: null,
		// _stale: private Boolean
		//     The freshness of CRUD data
		_stale: true,
		// _timeout: private Number
		//     Timeout for service requests, in milliseconds
		_timeout: 15000,
		// baseServiceUrl: String
		//     The base URL for all CRUD services
		baseServiceUrl: null,
		// dataType: String
		//     The type of CRUD data, used with app/profile/crud/TextMixin
		dataType: null,
		// listItemRightText: String
		//     The data attribute used in generating the list's right text label
		listItemRightText: null, // TODO add default value
		// serviceUrl: String
		//     The API endpoint for CRUD data requests
		serviceUrl: null,
		// xhrUrl: String
		//     The full API endpoint for CRUD data requests
		//     (the baseServiceUrl + serviceUrl)
		xhrUrl: null,

		// dfds: Object
		//		An assoc array where the values are deferreds that are in flight 
		//		or otherwise in use...
		dfds: null,

		constructor: function(){
			topic.subscribe("update://profile/"+this.serviceUrl, lang.hitch(this,this.staleSubscriber));

			this.dfds = {};
		},

		staleSubscriber: function(from){
			if(from != this.serviceUrl){
				this.setStale(true);
			}
		},

		startup: function() {
			// summary:
			//     Authenticate the user and activate the module
			this.inherited(arguments);

			this.xhrUrl = this.baseServiceUrl + this.serviceUrl;
			this._getIdentity = identity.getUser(/*force login*/ true);
			var options = {
				dataType: this.dataType
			};
			this.createViews(options);
		},

		createViews: function(options) {
			// summary:
			//     Create and registers the CRUD views
			this.rootView = new ListView(options);
			this.registerView(this.rootView);
			this.displayView = new DisplayView(options);
			this.registerView(this.displayView);
			this.editView = new EditView(options);
			this.registerView(this.editView);
			this.createView = new CreateView(options);
			this.registerView(this.createView);
		},

		getData: function(/*Boolean?*/ forceRefresh) {
			// summary:
			//     Authenticate the user and query the service URL for CRUD data.
			//     Returns a deferred that resolves with the data.
			// forceRefresh:
			//     Force a refresh of stuff even if the stuff isn't stale
			
			var dfd = new Deferred();

			var errorHandler = function(err) {
				errorUtils.handleNetworkError(err, true);
				dfd.reject(err);
			};

			if (this._stale || forceRefresh) {
				if(this.dfds.identity && !this.dfds.identity.isCanceled()){
					this.dfds.identity.cancel('Aborting previous identity deferred and re-trying.');
				}

				if(this.dfds.getData && !this.dfds.getData.isCanceled()){
					this.dfds.getData.cancel('Aborting previous getData deferred and re-trying.');
				}
				// query the user's identity, forcing authentication
				this.dfds.identity = this._getIdentity.then(
					lang.hitch(this, function(userIdentity) {
						delete this.dfds.identity;
						// save the user's identity
						this._identity = userIdentity;
						// Query the service URL for CRUD data
						this.dfds.getData = xhr.get(this.xhrUrl, {
							handleAs: 'json',
							timeout: this.timeout,
							preventCache: true
						}).then(
							lang.hitch(this, function(data) {
								delete this.dfds.getData;

								console.log("!!DATA", data);
								//make a parser for the data
								this.parser = new Parser(data);
								// save the data
								//this._data = data;
								this._stale = false;
								// resolve the deferred
								dfd.resolve(this.parser);
							}), errorHandler
						);
					}), errorHandler
				);
			} else {
				// if the data is cached and isn't stale,
				// resolve immediately
				dfd.resolve(this.parser);
			}
			return dfd;
		},

		saveData: function(/*String*/saveType,/*Object*/item, /*Object*/ payload) {
			// summary:
			//     Saves the CRUD data to the server, returning a
			//     deferred.
			// item:
			//     The CRUD item to save
			// payload:
			//     An object containing the CRUD data payload

			var method,url,
				dfd = new Deferred();
			if(this.dfds.identity && !this.dfds.identity.isCanceled()){
				this.dfds.identity.cancel('Aborting previous identity deferred and re-trying.');
			}

			if(this.dfds.saveData && !this.dfds.saveData.isCanceled()){
				this.dfds.saveData.cancel('Aborting previous saveData deferred and re-trying.');
			}

			this.dfds.identity = this._getIdentity.then(lang.hitch(this, function(userIdentity) {
				delete this.dfds.identity;
				saveType = saveType.toLowerCase();
				switch(saveType){
					case 'create':
						method = 'POST';
						url = this.xhrUrl;
					break;
					case 'edit':
						method = 'POST';
						url = this.baseServiceUrl + item.getValueById('objectURI');
					break;
					case 'delete':
						method = 'DELETE';
						url = this.baseServiceUrl + item.getValueById('objectURI');
					break;
				}
				
				this.dfds.saveData = xhr(url, {
					method: method,
					data: json.stringify(payload),
					headers: { 'Content-Type':'application/json; charset=utf-8' },
					handleAs: 'json',
					timeout: this.timeout
				}).then(lang.hitch(this,function(data) {
					delete this.dfds.saveData;
					console.log('SAVE SUCCESS:', data);
					dfd.resolve(data);
				}), lang.hitch(this,function(err) {
					delete this.dfds.saveData;
					console.log('SAVE ERROR:', err);
					errorUtils.handleNetworkError(err, true);
					dfd.reject(err);
				}));
			}));

			topic.publish("update://profile/"+this.serviceUrl, this.serviceUrl);

			return dfd;
		},

		deactivate: function(){
			this.inherited(arguments);
			console.log('deactivating all dfds.');
			for(var i in this.dfds){
				if(this.dfds.hasOwnProperty(i)){
					this.dfds[i].cancel(i + " cancelled due to module deactivation.");
					delete this.dfds[i];
				}
			}
		},

		setStale: function(/*Boolean*/ value) {
			// summary:
			//     Sets the stale attribue, forcing
			//     a refresh on the next data request
			this._stale = value;
		}
	});
});
