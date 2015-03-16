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
		'dojo/dom-class',
		'app/layout/ScrollableView',
		'app/util/crud/TextMixin'
], function(declare, domClass, ScrollableView, TextMixin) {
	
	// module:
	//     app/util/crud/View

	return declare([ScrollableView, TextMixin], {
		// summary:
		//     The base view for CRUD views

		// viewType: String
		//     The type of this view, used with nls resources (app/util/crud/TextMixin)
		viewType: null,

		activate: function() {
			this.inherited(arguments);
			domClass.add(document.body, 'crud');
		},

		deactivate: function() {
			this.inherited(arguments);
			domClass.remove(document.body, 'crud');
		}

	});
});
