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
		'dojo/sniff',
		'dojox/mobile/ProgressIndicator'
], function(declare, has, ProgressIndicator) {
	return declare([ProgressIndicator], {

		// module:
		//   app/util/ProgressIndicator

		gif: '/app/resources/img/spinners/36x36.gif',

		buildRendering: function() {
			// summary:
			//    Fallback to animated gif for supported browsers without CSS3 support (IE8)
			var start;
			if (has('ie') && has('ie') < 9) {
				start = this.startSpinning;
				if (start) {
					this.startSpinning = false;
				}
				// call dojox.mobile.ProgressIndicator buildRendering
				// without starting the animation in order to get
				// the image node
				this.inherited(arguments);
				// set the animated gif
				this.setImage(this.gif);
				// then start, if needed
				if (start) {
					this.startSpinning = true;
					this.start();
				}
			} else {
				this.inherited(arguments);
			}
		}

	});
});
