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
		'dojo/dom-class',
		'dojo/dom-construct',
		'dojo/topic',
		'dijit/_WidgetBase'
], function(declare, domClass, domConstruct, topic, WidgetBase) {

	// module:
	//     dojo-mama/View

	return declare([WidgetBase], {
		// summary:
		//     A base module view. The view publishes the following topics:
		//
		//     '/dojo-mama/activateView' 
		//           Published when the view has been activated.
		//           Receives a reference to the view.
		//     '/dojo-mama/deactivateView'
		//           Published when the view has been deactivated
		//           Receives a reference to the view.

		// active: Boolean
		//     Represents the state of this view
		active: false,
		// route: String
		//     The route to match to show this view
		route: null,
		// router: Object
		//     A module-relative router provided by dojo-mama/Module upon view registration
		router: null,

		postCreate: function() {
			// summary:
			//     Override postCreate with your module's content
			// tags:
			//     extension

			this.inherited(arguments);
			if (this.route === null) {
				console.error('[dojo-mama] view route not defined:', this);
			}
		},

		activate: function(/*Object*/ e) {
			// summary:
			//     Called when a view is shown, settings this.active to true
			// e:
			//     The dojo/router event

			console.log('[dojo-mama] activating view:', this.module.name, this.route);
			this.set('active', true);
			topic.publish('/dojo-mama/activateView', this);

			domClass.remove(document.body, 'loading');
		},

		deactivate: function() {
			// summary:
			//     Called when a view is hidden, settings this.active to false

			console.log('[dojo-mama] deactivating view:', this.module.name, this.route);
			this.set('active', false);
			topic.publish('/dojo-mama/deactivateView', this);
		}

	});
});
