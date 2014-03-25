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
		'dojo/_base/lang',
		'dojo/_base/window',
		'dojo/on',
		'dojo/has',
		'dojo/keys',
		'dojo/touch',
		'dojox/gesture/swipe',
		'dojo/dom-construct',
		'dojo/dom-style',
		'dojo/dom-class',
		'dojo/dom-geometry',
		'dijit/_WidgetBase',
		'app/util/dom-utils'
], function(declare, lang, win, on, has, keys, touch, swipe, domConstruct, domStyle, domClass, domGeom,
	WidgetBase, domUtils) {

	// module:
	//     app/util/Lightbox

	return declare([WidgetBase], {
		// summary:
		//     The Lightbox base class
		//
		// description:
		//     This class maganages the lightbox.  It displays five items at a time
		//     (references are kept in displayedItems array).  It also manages calling
		//     the lifecycle of the lightbox items.  When items are moved to the displayedItems
		//     array, build() is called.  When the item becomes the center item, activate()
		//     is called.  When the item is no longer the center item, deactivate() is called.
		//     When an item is removed from displayedItems, destroy() is called.

		baseClass: 'lightbox',


		// dragHandler: Object
		//     This stores the object used to start and stop the drag handler
		dragHandler: null,

		// displayedItems: Array
		//     This stores the five lightbox items currently displayed.
		//     The middle item is the active one.
		displayedItems: null,

		// allItems: Array
		//     This stores all the lightbox items to be used by the lightbox
		allItems: null,

		// currentIndex: Integer
		//     This is the index into allItems that is currently active
		currentIndex: null,

		// itemSize: Object
		//     This stores the max size usable to each item
		itemSize: null,

		// itemPadding: Integer
		//     This stores how much padding should be between each item
		itemPadding: 40,

		// title: Object
		//     This is the h4 element
		title: null,

		// titleBarDiv: Object
		//     the title bar element
		titleBarDiv: null,

		// exitButton: Object
		//     The exit button element
		exitButton: null,

		// toolbarDiv: Object
		//     The toolbar (for arrows and play/pause button) element
		toolbarDiv: null,

		// prevButton: Object
		//     The previous button element
		prevButton: null,
		// nextButton: Object
		//     The next button element
		nextButton: null,
		// playButton: Object
		//     The play/pause button element
		playButton: null,

		constructor: function () {
			// summary:
			//     This function initializes the objects and arrays needed
			this.displayedItems = [null,null,null,null,null];
			this.allItems = [];
			this.itemSize = {w: 0, h: 0};
		},

		buildRendering: function() {
			// summary:
			//     Builds all the basic lightbox elements, builds the drag handler,
			//     and the click handlers.

			this.inherited(arguments);
			this.titleBarDiv = domConstruct.create('div', {
				'class': 'lightboxTitleBar'
			}, this.domNode);
			this.exitButton = domConstruct.create('div', {
				'class': 'lightboxExit icon-close'
			}, this.titleBarDiv);
			this.title= domConstruct.create('h4', {
				'class': 'lightboxTitle',
				innerHTML: 'Title Here!'
			}, this.titleBarDiv);
			this.toolbarDiv = domConstruct.create('div', {
				'class': 'lightboxToolbar'
			}, this.domNode);

			this.prevButton = domConstruct.create('div', {
				'class': 'lightboxPrevButton icon-arrow-left'
			}, this.toolbarDiv);
			this.playButton = domConstruct.create('div', {
				'class': 'lightboxPlayButton icon-play'
			}, this.toolbarDiv);
			this.nextButton = domConstruct.create('div', {
				'class': 'lightboxNextButton icon-arrow-right'
			}, this.toolbarDiv);



			this.dragHandler = this.createDragHandler(
				lang.hitch(this, this.onDragStart),
				lang.hitch(this, this.onDrag),
				lang.hitch(this, this.onDragStop)
				);

			var _this = this;
			on(this.nextButton, 'click', function (e) {
				e.stopPropagation();
				console.log('got next arrow press');
				_this.next();
			});
			on(this.prevButton, 'click', function (e) {
				e.stopPropagation();
				console.log('got prev arrow press');
				_this.prev();
			});

			on(this.exitButton, 'click', function (e) {
				e.stopPropagation();
				console.log('got exit press');
				_this.exit();
			});

			on(this.playButton, 'click', function (e) {
				e.stopPropagation();
				console.log('got play/pause button press');
				if (domClass.contains(_this.playButton, 'icon-play')) {
					_this.play();
				} else {
					_this.pause();
				}
			});

			domUtils.cufonify();
			this.resize();
			this.hide();
		},

		resize: function () {
			// summary:
			//     Called whenever sizes need to be recalculated.
			this.inherited(arguments);

			// width is set to 70% of screen width
			this.itemSize.w = window.innerWidth || document.documentElement.clientWidth;
			this.itemSize.w *= 0.7;

			// height is set to screen height - 110 pixels (space for title and toolbar)
			this.itemSize.h = window.innerHeight || document.documentElement.clientHeight;
			this.itemSize.h -= 110;


			// recalculate positions (which are based on item sizes)
			this.onDrag(0,0);

			// call resize on each item that is displayed
			var i;
			for (i=0; i<5; i++) {
				if (this.displayedItems[i]) {
					this.displayedItems[i].resize(this.itemSize);
				}
			}

		},


		onDragStart: function () {
			// summary:
			//     Called whenever a finger drag is started, it disables transitions on each
			//     displayed elemnt (so drag movement is instantaeous).
			var i = 0;
			for (i=0; i < 5; i++) {
				if (this.displayedItems[i]) {
					this.displayedItems[i].stopTransitions();
				}
			}
		},

		onDrag: function (x,y) {
			// summary:
			//     Called on a finger move.  Moves each element.
			// x: Integer
			//     The delta x
			// y: Integer
			//     The delta y
			var i = 0;
			for (i=0; i < 5; i++) {
				if (this.displayedItems[i]) {
					this.displayedItems[i].moveTo(
						(i-2)*this.itemSize.w +
						(i-2)*this.itemPadding + x, 0);
				}
			}
		},

		onDragStop: function (x,y) {
			// summary:
			//     Called on a finger drag stop.  Enables the transitions and calls next
			//     and/or prev if needed.
			// x: Integer
			//     The delta x
			// y: Integer
			//     The delta y
			console.log('Stop', x);
			var i;
			for (i=0; i < 5; i++) {
				if (this.displayedItems[i]) {
					this.displayedItems[i].startTransitions();
				}
			}

			if (x > (this.itemSize.w + this.itemPadding)/2.0) {
				this.prev();
			}
			else if (x < -(this.itemSize.w + this.itemPadding)/2.0) {
				this.next();
			}
			this.onDrag(0,0);
			console.log(this.displayedItems);
		},

		next: function () {
			// summary:
			//     Moves to the next item.
			console.log('Next!');

			if (this.displayedItems[3] === null) {
				return; // no item to go to!
			}

			// if the left most item exists, destroy it
			if (this.displayedItems[0]) {
				this.displayedItems[0].destroy();
			}
			var i;

			// deactivate the currently active item
			this.deactivateItem(this.displayedItems[2]);
			// move each item over in the array
			for (i=0; i<4; i++ ) {
				this.displayedItems[i] = this.displayedItems[i+1];
			}
			this.currentIndex++;
			// activate the next item
			this.activateItem(this.displayedItems[2]);

			// build a new item for the rightmost item if it exists
			if (this.allItems[this.currentIndex+2]) {
				this.displayedItems[4] = this.allItems[this.currentIndex+2];
				this.displayedItems[4].build();
				this.displayedItems[4].resize(this.itemSize);
				domConstruct.place(this.displayedItems[4].domNode, this.domNode);
			} else {
				this.displayedItems[4] = null;
			}
			this.onDrag(0,0);
		},


		prev: function () {
			// summary:
			//     Moves to the previous item.

			console.log('Prev!');
			if (this.displayedItems[1] === null) {
				return; // no item to go to!
			}

			// if the rightmost most item exists, destroy it
			if (this.displayedItems[4]) {
				this.displayedItems[4].destroy();
			}
			var i;
			// deactivate the currently active item
			this.deactivateItem(this.displayedItems[2]);
			// moe each item in the displayed array
			for (i=4; i>0; i-- ) {
				this.displayedItems[i] = this.displayedItems[i-1];
			}
			this.currentIndex--;
			// deactivate the previous active item
			this.activateItem(this.displayedItems[2]);

			// build a new item for the left most item if it exists
			if (this.allItems[this.currentIndex-2]) {
				this.displayedItems[0] = this.allItems[this.currentIndex-2];
				this.displayedItems[0].build();
				this.displayedItems[0].resize(this.itemSize);
				domConstruct.place(this.displayedItems[0].domNode, this.domNode);
			} else {
				this.displayedItems[0] = null;
			}
			this.onDrag(0,0);
		},

		play: function () {
			// summary:
			//     Called when the play button is pressed. Override this to enable it's functionality.
			//     Make sure you call inherrited, since it handles the icon swap.
			console.log('lightbox play!');
			domClass.replace(this.playButton, 'icon-pause', 'icon-play');
		},

		pause: function () {
			// summary:
			//     Called when the pause button is pressed. Override this to enable it's functionality.
			//     Make sure you call inherrited, since it handles the icon swap.
			console.log('lightbox pause!');
			domClass.replace(this.playButton, 'icon-play', 'icon-pause');
		},

		exit: function() {
			// summary:
			//     Called when the exit button is pressed.
			this.hide();
		},

		activateItem: function (item) {
			// summary:
			//     Activates an item, sets the title
			// item: Object
			//     The item to activate
			item.activate();
			this.title.innerHTML = item.getTitle();
		},
		deactivateItem: function (item) {
			// summary:
			//     Deactivates an item
			// item: Object
			//     The item to deactivate
			item.deactivate();
		},



		setItems: function (items) {
			// summary:
			//     Sets the list of items to use in the lightbox
			// items: Array
			//     The array of lightbox items
			this.allItems = items;

			console.log(items);

			var i;
			for (i = 0; i < this.allItems.length; i++) {
				this.allItems[i].lightbox = this;
			}

			// REMOVED, was causing routing issues. See ticket #128
			// force a refresh: 
			//var index = this.currentIndex;
			this.currentIndex = null;
			//if (index !== null) {
			//	console.log("LIGHTBOX REFRESHING");
			//	this.gotoIndex(index);
			//}
		},

		gotoIndex: function (index) {
			// summary:
			//     Moves to the particular index
			// index:
			//     The index to go to.



			// check to see if we are already close, and use next/prev if we are (for transitions)
			var offset = index-this.currentIndex;
			if (this.currentIndex != null) {
				if (offset === -1) {
					this.prev();
					return;
				}
				if (offset === 1) {
					this.next();
					return;
				}
				if (offset === 0) {
					return;
				}
			}

			// otherwise move directly there, making sure we deactivate, destroy everything
			if (this.currentIndex !== null && this.allItems[this.currentIndex]) {
				this.deactivateItem(this.allItems[this.currentIndex]);
			}
			this.currentIndex = index;
			var i;
			for (i=0; i<5; i++) {
				if (this.displayedItems[i]) {
					this.displayedItems[i].destroy();
				}
			}
			for (i=0; i<5; i++) {
				if (this.allItems[index+i-2])
				{
					this.displayedItems[i] = this.allItems[index+i-2];
					this.displayedItems[i].build();
					this.displayedItems[i].resize(this.itemSize);
					domConstruct.place(this.displayedItems[i].domNode, this.domNode);
				} else {
					this.displayedItems[i] = null;
				}
			}
			this.onDrag(0,0);

			this.activateItem(this.allItems[index]);

		},


		placeOnBody: function () {
			// summary:
			//     Call this function to have the lightbox insert itself onto the body element.
			//     Note that it must be inserted into the body, since if it is inserted into the module,
			//     the z-index will be messed up on IOS devices.
			this.placeAt(win.body());
		},


		show: function () {
			// summary:
			//     Shows the lightbox, starts global handlers
			domClass.remove(this.domNode, 'hidden');
			this.dragHandler.start();
			this.installKeyboardHandler();
		},

		hide: function () {
			// summary:
			//     Hides the lightbox, stops global handlers
			domClass.add(this.domNode, 'hidden');
			this.dragHandler.stop();
			this.removeKeyboardHandler();
		},


		createDragHandler: function (onDragStart, onDrag, onDragDone) {
			// summary:
			//     Creates a drag handler.
			// onDragStart: function
			//     Function called on when a drag event starts
			// onDrag: function
			//     Function called on when a finger moves durring a drag event.
			//     Should take a delta x, and delta y as arguments
			// onDragDone: function
			//     Function called on when a drag event stops
			//     Should take a delta x, and delta y as arguments

			var pressHandler = null,
				releaseHandler = null,
				cancelHandler = null,
				moveHandler = null;

			var isDragging = false;
			var dragStartLocX = 0;
			var dragStartLocY = 0;

			function dragStart(e) {
				// summary:
				//     Called when a drag starts
				e.preventDefault();
				isDragging = true;
				dragStartLocX = e.pageX;
				dragStartLocY = e.pageY;
				onDragStart();
			}

			function drag(e) {
				// summary:
				//     Called when a finger drags
				e.preventDefault();
				if (isDragging) {
					onDrag(e.pageX - dragStartLocX, e.pageY - dragStartLocY);
				}
			}

			function dragStop(e) {
				// summary:
				//     Called when a drag stops
				e.preventDefault();
				if (isDragging) {
					onDragDone(e.pageX - dragStartLocX, e.pageY - dragStartLocY);
				}
				isDragging = false;
			}

			function startHandlers() {
				// summary:
				//     Attach all the drag handlers.  They are attached to
				//     the body.
				isDragging = false;
				if (!pressHandler) {
					pressHandler = touch.press(win.body(), dragStart);
					moveHandler = touch.move(win.body(), drag);
					releaseHandler = touch.release(win.body(), dragStop);
					// this may not actually be doing anything:
					cancelHandler = touch.cancel(win.body(), dragStop);
				}
			}

			function stopHandlers() {
				// summary:
				//     Remove all the drag handlers.
				if (pressHandler) {
					pressHandler.remove();
					pressHandler = null;
					releaseHandler.remove();
					releaseHandler = null;
					cancelHandler.remove();
					cancelHandler = null;
					moveHandler.remove();
					moveHandler = null;
				}
				isDragging = false;
			}

			return {start: startHandlers, stop: stopHandlers};
		},

		// keyHandler: Object
		//     The dojo event handler associated with the keyboard event receiver
		keyHandler: null,
		installKeyboardHandler: function () {
			// summary:
			//     Installs a keyboard handler if it was not already done before.
			if (!this.keyHandler) {
				var _this = this;
				this.keyHandler = on(win.body(), 'keydown', function (e) {
					switch (e.keyCode)
					{
						case keys.LEFT_ARROW:
							_this.prev();
							break;
						case keys.RIGHT_ARROW:
							_this.next();
							break;
						case keys.ESCAPE:
							_this.exit();
							break;
						case keys.SPACE:
							if (domClass.contains(_this.playButton, 'icon-play')) {
								_this.play();
							} else {
								_this.pause();
							}
							break;
					}

				});
			}
		},

		removeKeyboardHandler: function () {
			// summary:
			//     Removes the keyboard handler.
			if (this.keyHandler) {
				this.keyHandler.remove();
				this.keyHandler = null;
			}
		}

	});
});
