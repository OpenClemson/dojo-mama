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
		'dojo/dom-construct',
		'dojo/dom-style',
		'dojo/dom-class',
		'dojo/has'
], function(declare, domConstruct, domStyle, domClass, has) {
	// global ID is just for debugging
	var globalID = 0;

	// module:
	//     app/util/LightboxItem
	return declare([], {
		// summary:
		//     This class provides a mechanism to handle the life cycle of light box items.

		// size: Object
		//     Object with w and h for the max size the light box should take up
		size: null,

		// domNode: Object
		//     The base dom element  (div unless it is overriden)
		domNode: null,

		// lightbox: Object
		//     The lightbox this item is a part of. Set in Lightbox#setItems
		lightbox: null,

		constructor: function () {
			this.size = {w: 0, h: 0};
			this.id = globalID++;
		},

		build: function () {
			// summary:
			//     Builds a dom node (div). Override if needed.
			console.log('lightboxitem build called', this.id);
			this.domNode = domConstruct.create('div', {
				'class': 'lightboxItem transition'
			});
		},
		destroy: function () {
			// summary:
			//     Destroys the dom node and does any needed cleanup.
			//     Override if more cleanup is needed.
			console.log('lightboxitem destroy called', this.id);
			domConstruct.destroy(this.domNode);
		},

		moveTo: function (x, y) {
			// summary:
			//     Moves the item.

			// ie8 does not support transform, just hide other stuff
			if (has('ie') < 9) {
				if (Math.abs(x) < this.size.w/2) {
					domClass.remove(this.domNode, 'hidden');
				} else {
					domClass.add(this.domNode, 'hidden');
				}
				return;
			}

			// respectable browsers do support transform
			var scale = 1.0 - Math.abs(x)/this.size.w*0.5;
			var transfun = 'translate('+x*0.75+'px,'+y+'px)';
			var scalefun = 'scale('+scale+','+scale+')';
			var tr = transfun + ' ' + scalefun;
			domStyle.set(this.domNode, {
				'transform': tr,
				'-ms-transform': tr,
				'-webkit-transform': tr
			});
		},

		stopTransitions: function () {
			// summary:
			//     Stops transitions.
			domClass.remove(this.domNode, 'transition');
		},
		startTransitions: function () {
			// summary:
			//     Starts transitions.
			domClass.add(this.domNode, 'transition');
		},

		activate: function () {
			// summary:
			//     Called on item activate.  Override this to do fancy stuff.
			console.log('lightboxitem activate called', this.id);
		},

		deactivate: function () {
			// summary:
			//     Called on item deactivate.  Override this to do fancy stuff.
			console.log('lightboxitem deactivate called', this.id);
		},

		getTitle: function () {
			// summary:
			//     returns the lightbox title.  Override this.
			return 'This is lightbox ' + this.id;
		},

		resize: function(size) {
			// summary:
			//     Called whenever the size changes.  Override this if you need to
			//     maintain aspec ratio or other stuff.
			// size: Object
			//     The new maximum size for an item.
			this.size = size;
			domStyle.set(this.domNode, {
				width: size.w + 'px',
				marginLeft: -size.w/2 + 'px',
				height: size.h + 'px',
				marginTop: -size.h/2 + 'px'
			});
		},


		resizeKeepApectRatio: function (size, max_width, max_height) {
			// summary:
			//     resizes domNode, keeping aspect ratio
			//     a utility function that can be called if you override resize()

			if (size.w === 0 && size.h === 0) {
				return;
			}

			var contentAspectRatio = max_width/max_height;
			var screenAspectRatio = size.w/size.h;
			var widthIsLimiting = contentAspectRatio > screenAspectRatio;
			var contentIsLimiting = null;
			if (widthIsLimiting) {
				contentIsLimiting = (size.w > max_width);
			}
			if (!widthIsLimiting) {
				contentIsLimiting = (size.h > max_height);
			}
			
			if (contentIsLimiting) {
				domStyle.set(this.domNode, {
					width: max_width+ 'px',
					marginLeft: -max_width/2+ 'px',
					height: max_height + 'px',
					marginTop: -max_height/2 + 'px'
				});
			} else {
				var new_w, new_h;
				if (widthIsLimiting) {
					new_w = size.w;
					new_h = new_w / contentAspectRatio;
				} else {
					new_h = size.h;
					new_w = new_h * contentAspectRatio;
				}
				domStyle.set(this.domNode, {
					width: new_w + 'px',
					marginLeft: -new_w/2+ 'px',
					height: new_h + 'px',
					marginTop: -new_h/2 + 'px'
				});
 
			}
		}



	});
});
