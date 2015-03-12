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
		'dojo/hash',
		'dojo/router/RouterBase',
		'dojo/topic'
], function(declare, lang, hash, RouterBase, topic) {

	// module:
	//     dojo-mama/views/Module

	// utility methods for routing, from dojo/router/RouterBase.js
	var idMatch = /:(\w[\w\d]*)/g,
		idReplacement = '([^\\/]+)',
		globMatch = /\*(\w[\w\d]*)/,
		globReplacement = '(.+)';

	var convertRouteToRegEx = function(/*String*/ route) {
		// Sub in based on IDs and globs
		route = route.replace(idMatch, idReplacement);
		route = route.replace(globMatch, globReplacement);
		// Make sure it's an exact match
		route = '^' + route + '$';
		return new RegExp(route);
	};

	var getParameterNames = function(/*String*/ route) {
		var parameterNames = [],
			match;
		idMatch.lastIndex = 0;
		while ((match = idMatch.exec(route)) !== null) {
			parameterNames.push(match[1]);
		}
		if ((match = globMatch.exec(route)) !== null) {
			parameterNames.push(match[1]);
		}
		return parameterNames.length ? parameterNames : null;
	};

	return declare([], {
		// summary:
		//     A base module class. The module publishes the following topics:
		//
		//     '/dojo-mama/activateModule'
		//           Published when the module has been activated.
		//           Receives a reference to the module.
		//     '/dojo-mama/deactivateModule'
		//           Published when the module has been deactivated
		//           Receives a reference to the module.

		// active: Boolean
		//     Represents the module's state
		active: false,
		// config: [private] Object
		//     The config object
		config: null,
		// currentView: [private] Object
		//     The currently active view
		currentView: null,
		// moduleId: String
		//     Contains the dojo path to the module
		moduleId: '',
		// name: String
		//     The key used in dmConfig for this module
		name: '',
		// router: Object
		//     The module's router
		router: null,
		// routes: Array
		//     The module's routes
		routes: null,

		constructor: function(/*Object*/ args) {
			lang.mixin(this, args);
			// provide router methods
			this.router = {
				go: lang.hitch(this, function(route) {
					hash(this.getRouteHref(route));
				})
			};
			this.routes = [];
		},

		startup: function() {
			// summary:
			//     Invoked upon module instantiation,
			//     startup should register any view routes
			//     with this.router.register

			// Override this function to register module routes!
		},

		activate: function(/*Object*/ e) {
			// summary:
			//     Activates a module.
			// e:
			//     The router event, similar to a dojo/router event.
			//     The event does not have preventDefault or stopImmediatePropagation
			//     methods.
			console.log('[dojo-mama] activating module:', this.name);
			topic.publish('/dojo-mama/activateModule', this);
		},

		deactivate: function(/*Object*/ e) {
			// summary:
			//     Deactivates a module.
			// e:
			//     The router event causing the module to be deactivated
			console.log('[dojo-mama] deactivating module:', this.name);
			topic.publish('/dojo-mama/deactivateModule', this);
			if (this.currentView) {
				this.currentView.deactivate();
			}
			this.currentView = null;
		},

		getAbsoluteRoute: function(/*String?*/ route) {
			// summary:
			//     Return the absolute route for a module's view route
			// route:
			//     A module-relative view route

			// no trailing slashes
			var r = (route === '/') ? '' : route,
				base = (this.name === 'index') ? '' : this.name;
			return '/' + base + r;
		},

		getRouteHref: function(/*String?*/ route) {
			// summary:
			//     Return an absolute href for a module's view route
			// route:
			//     A module-relative view route

			return '#' + this.getAbsoluteRoute(route);
		},

		registerView: function(/*Object*/ view) {
			// summary:
			//     Registers the view's route with the router, using view.route
			//     as the route to invoke view.activate.
			// view:
			//     A dojo-mama/View

			// give the view a handle to its module
			view.module = this;
			// provide router methods
			view.router = this.router;
			// register the view with the router
			this.registerViewRoute(view, view.route);
		},

		registerViewRoute: function(/*Object*/ view, /*String*/ route, /*Function?*/ callback) {
			// summary:
			//     Register a view's route with the router
			// view:
			//     A dojo-mama/View
			// route:
			//     The view route, in the same format as a dojo/router String route
			// callback:
			//     The callback function to be invoked upon routing.
			//     If not given, view.activate will be used as the callback and hitched to the view.

			// register the route
			this.routes.push({
				callback: callback || lang.hitch(view, view.activate),
				parameterNames: getParameterNames(route),
				route: convertRouteToRegEx(route),
				view: view
			});
		},

		destroy: function() {
			// summary:
			//     Destroys the module and its registered routes

			console.log('[dojo-mama] destroying module:', this.name);
			this.active = false;
			this.config = null;
			this.currentView = null;
			this.moduleId = '';
			this.name = '';
			this.router = null;
			this.routes = [];
		}

	});
});
