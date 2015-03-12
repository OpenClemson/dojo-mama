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
		'dojo/topic',
		'dojo-mama/View',
		'app/layout/layout'
], function(declare, topic, View, layout) {

	return declare([View], {
		// summary:
		//     A base module view for the my.Clemson app

		// title: String
		//     A title shown in the sub nav. If undefined, the module's title is shown
		//     To explicitly avoid setting the title when a view loads, set the view's title to `null`.
		title: undefined,

		// _started: Boolean
		//     Ensures startup is run on views prior to activation, if needed
		_started: false,

		activate: function(/*Object*/ e) {
			// summary:
			//     Called when a view is shown, settings this.active to true
			// e:
			//     The dojo/router event

			// startup if needed
			if (!this._started && typeof this.startup === 'function') {
				this.startup();
				this._started = true;
			}

			this.inherited(arguments);

			// add the view's dom node to the layout
			layout.addView(this);

			if (this.title !== undefined) {
				layout.updateTitle(this.title);
			} else if (this.module.title !== undefined) {
				layout.updateTitle(this.module.title);
			}
		}

	});
});
