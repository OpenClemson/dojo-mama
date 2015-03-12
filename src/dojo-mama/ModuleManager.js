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
define(['dojo/_base/declare',
		'dojo/_base/lang',
		'dojo/Deferred',
		'dojo/hash',
		'dojo/topic'
], function(declare, lang, Deferred, hash, topic) {

	// module:
	//     dojo-mama/ModuleManager

	return declare([], {
		// summary:
		//     Manages the instantiation, caching, and routing of modules and their views.
		//     The module manager publishes the following topics:
		//
		//     '/dojo-mama/moduleLoadError'
		//           Published when a require error occurs.
		//           Receives the error.
		//     '/dojo-mama/startLoadingModule'
		//           Published when a module begins loading.
		//           Receives the module name.
		//     '/dojo-mama/doneLoadingModule'
		//           Published when a module finishes loading.
		//           Receives the module name.
		//     '/dojo-mama/routeError'
		//           Published when a route error occurs.
		//           Receives the route that caused the error.

		// activeModule: [private] Object
		//     The currently active module
		activeModule: null,
		// config: [private] Object
		//     The module configuration
		config: null,
		// hashChangeTopicHandle: [private] Object
		//     The hashchange dojo/topic handle
		hashChangeTopicHandle: null,
		// lastRoute: [private] Object
		//     The last route object
		lastRoute: null,
		// newPath: [private] String
		//     The current hash
		newPath: '',
		// oldPath: [private] String
		//     The last hash
		oldPath: '',
		// modules: [private] Object
		//     The module cache
		modules: {},
		// moduleRegEx: [private] RegEx
		//     The regular expression used to match module names in routes
		moduleRegEx: /^\/([^\/]+)/,
		
		constructor: function(/*Object*/ args) {
			lang.mixin(this, args);
			console.log('[dojo-mama] instantiating module manager');
		},

		startup: function() {
			// summary:
			//     Start up the module manager
			// returns:
			//     A dojo/Deferred that resolves after the inital
			//     routing completes

			var dfd;

			// verify config
			if (!(this.config && this.config.modules)) {
				console.error('[dojo-mama] invalid configuration');
				return;
			}

			// handle any AMD errors
			require.on('error', function(/*Object*/ e) {
				console.error('[dojo-mama] module load error:', e);
				topic.publish('/dojo-mama/moduleLoadError', e);
			});

			// handle current hash
			dfd = this.handleHashChange(hash());

			// subscribe to additional hash change events
			this.hashChangeTopicHandle = topic.subscribe('/dojo/hashchange', lang.hitch(this, this.handleHashChange));

			return dfd;
		},

		handleHashChange: function(/*String*/ newHash) {
			// summary:
			//     Handles hashchange events
			// newHash:
			//     The new hash string
			// returns:
			//     A dojo/Deferred that resolves after the hash
			//     change has been handled

			var module, moduleName,
				matches, route,
				dfd = new Deferred();

			// remove trailing slashes
			if (newHash.slice(-1) === '/') {
				newHash = newHash.slice(0, -1);
			}

			// save the old hash
			this.oldPath = this.newPath;
			this.newPath = newHash;

			// get module name from hash
			if (newHash === '') {
				moduleName = 'index';
			} else {
				matches = this.moduleRegEx.exec(newHash);
				if (!matches) {
					this.handleRouteError();
					return;
				}
				moduleName = matches[1];
				route = newHash.slice(matches[0].length);
			}

			if (!route) {
				route = '/';
			}

			// route the module
			if (!this.config.modules.hasOwnProperty(moduleName)) {
				console.warn('[dojo-mama] module config undefined');
				this.handleRouteError();
				return;
			}
			module = this.modules[moduleName];
			if (module) {
				this.routeModule(module, route);
				dfd.resolve();
			} else {
				this.loadModule(moduleName).then(
					lang.hitch(this, function(instance) {
						this.routeModule(instance, route);
						dfd.resolve();
					}),
					lang.hitch(this, function(err) {
						console.warn('[dojo-mama]', err);
						dfd.reject(err);
					})
				);
			}
			return dfd;
		},

		loadModule: function(/*String*/ moduleName) {
			// summary:
			//     Dynamically requires a module by name
			// moduleName:
			//     The name of the module, as defined by the config
			// returns:
			//     A dojo/Deferred that resolves with a reference to
			//     the module instance

			var moduleConfig = lang.mixin({}, this.config.modules[moduleName]),
				moduleId = moduleConfig.moduleId,
				module,
				dfd = new Deferred();

			if (this.modules[moduleName]) {
				dfd.resolve(this.modules[moduleName]);
				return dfd;
			}

			if (!moduleId) {
				this.handleRouteError();
				dfd.reject('moduleId undefined', true);
				return dfd;
			}

			console.log('[dojo-mama] start loading module:', moduleName);
			topic.publish('/dojo-mama/startLoadingModule', moduleName);
			require([moduleId], lang.hitch(this, function(Module) {
				// extend dmConfig module settings with name and reference to the full config
				lang.mixin(moduleConfig, {
					name: moduleName,
					config: this.config
				});
				// create a cached instance of this module
				this.modules[moduleName] = module = new Module(moduleConfig);
				console.log('[dojo-mama] done loading module:', moduleName);
				topic.publish('/dojo-mama/doneLoadingModule', moduleName);
				// startup the module
				console.log('[dojo-mama] starting up:', moduleName);
				module.startup();
				dfd.resolve(module);
			}));

			return dfd;
		},

		routeModule: function(/*Object*/ module, /*String*/ route) {
			// summary:
			//     Routes a module's view
			// module:
			//     The instance of the module
			// route:
			//     The view route to search for

			console.log('[dojo-mama] routing:', module.name, route);
			// module-relative routing, based on dojo/router/RouterBase
			var callback, i, j, params, parameterNames, result,
				routeEvent, routeObj,
				routes = module.routes,
				numRoutes = routes.length,
				numParameters;

			params = {};
			for (i=0; i < numRoutes; ++i) {
				routeObj = routes[i];
				result = routeObj.route.exec(route);
				if (result) {
					if (routeObj.parameterNames) {
						parameterNames = routeObj.parameterNames;
						numParameters = parameterNames.length;
						for (j=0; j < numParameters; ++j) {
							params[parameterNames[j]] = result[j+1];
						}
					}
					callback = routeObj.callback;
					break;
				}
			}
			if (!callback) {
				this.handleRouteError();
				return;
			}
			routeEvent = {
				oldPath: this.oldPath,
				newPath: this.newPath,
				params: params
			};
			if (this.lastRoute) {
				this.lastRoute.view.deactivate(routeEvent);
			}
			this.lastRoute = routeObj;
			this.activateModule(module, routeEvent);
			callback(routeEvent);
		},

		activateModule: function(/*Object*/ module, /*Object*/ e) {
			// summary:
			//     Activates a module and deactivates the currently
			//     active module.
			// module:
			//     The module instance to activate
			// e:
			//     The router event

			var activeModule = this.activeModule;

			// don't reactivate the same module
			if (activeModule === module) {
				return;
			}

			// deactivate the currently active module
			if (activeModule) {
				activeModule.deactivate(e);
			}

			// activate the new module
			this.activeModule = module;
			module.activate(e);
		},

		handleRouteError: function() {
			// summary:
			//      Handles route errors

			var route = hash();
			if (this.activeModule) {
				this.activeModule.deactivate();
				this.activeModule = null;
			}
			if (this.lastRoute) {
				this.lastRoute.view.deactivate();
				this.lastRoute = null;
			}
			console.error('[dojo-mama] route error', route);
			topic.publish('/dojo-mama/routeError', route);
		},

		destroy: function() {
			// summary:
			//      Destroys all loaded modules and stops routing.

			var k;
			if (this.hashChangeTopicHandle) {
				this.hashChangeTopicHandle.remove();
			}
			for (k in this.modules) {
				if (this.modules.hasOwnProperty(k)) {
					this.modules[k].destroy();
					delete this.modules[k];
				}
			}
			this.activeModule = null;
			this.config = null;
			this.hashChangeTopicHandle = null;
			this.lastRoute = null;
			this.newPath = null;
			this.oldPath = null;
		}

	});
});
