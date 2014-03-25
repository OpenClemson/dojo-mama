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

define([
	'dojo/_base/declare',
	'dojo/_base/lang',
	'dojo/_base/window',

	'dojo/dom',
	'dojo/dom-attr',
	'dojo/dom-class',
	'dojo/dom-geometry',
	'dojo/dom-construct',
	'dojo/dom-style',
	'dojo/on',
	'dojo/has',
	'dojo/topic',

	'dijit/focus',
	'dijit/_WidgetBase'
], function(
	declare,
	lang,
	domWindow,

	domUtils,
	domAttr,
	domClass,
	domGeometry,
	domConstruct,
	domStyle,
	on,
	has,
	topic,

	focusUtil,
	_WidgetBase
) {

	// module:
	//     app/util/Select

	return declare([_WidgetBase], {
		// summary:
		//     A Javascript implementation of native select boxes
		//
		// description:
		//     This class can be used in place of a native select box.
		//     It takes in options as JS Objects that contain values and labels.
		//     If the application mode is mobile the popup will be fullscreen, dimming everything else.
		//     Otherwise the popup will be below the select box like native select boxes look on desktop browsers.

		// domNode: [readonly] DomNode
		//     This is our visible representation of the widget! Other DOM
		//     Nodes may by assigned to other properties, but the domNode
		//     property is the canonical "top level" node in widget UI.
		domNode: null,

		// labelNode: DomNode
		//     This is the domNode that holds the label of the currently selected option.
		labelNode: null,

		// arrowNode: DomNode
		//     This is the domNode that holds the down arrow and functions as an open / close button.
		arrowNode: null,

		// popupDomNode: DomNode
		//     This is the domNode that is the top level container of the popup.
		popupDomNode: null,

		// popupContainerNode: DomNode
		//     This is the domNode that contains the options and is contained by the popupDomNode.
		popupContainerNode: null,

		// baseClass: String
		//     This is the base CSS class applied to the domNode by _WidgetBase::buildRendering()
		baseClass: 'select',

		// _singleton: Object
		//     This is an Object that is created at class instantiation (as opposed to instance instantiation).
		//     Each instance contains a pointer to the one instance of this object, and therefore this object works
		//     like a singleton.
		_singleton: {
			// instanceCounter: Integer
			//     This keeps track of how many Selects exist at any given point.  THis gets incremented in the constructor
			//     and decremented in .destroy().  If in .destroy() this counter drops to zero after decrementation
			//     then .destroy() will also destroy the two singleton domNodes: fullScreenBackdropNode and sizeCheckerNode
			instanceCounter: 0,

			// fullscreenBackdropNode: DomNode
			//     This is the domNode that, if on mobile, dims everything behind the popup and catches click events.
			fullscreenBackdropNode: null,

			// sizeCheckerNode: DomNode
			//     This is the domnode that we use to check the pixel size of rendered text.
			sizeCheckerNode: null
		},

		// _open: Boolean
		//     Boolean that denotes whether the popup is open or not
		_open: false,

		// _popupMaxHeight: Integer
		//     This is an overridable integer that tells the popup what it's max height should be.
		//     Once past this height the popup should render a scroll bar.  Only applicable in non-mobile mode.
		_popupMaxHeight: 250,

		// _offsetWidth: Integer
		//     This is a static amount of pixels to add to the width of the select box.  The select boxes width
		//     is specified by the pixel width of the widest option label + _offsetWidth.
		_offsetWidth: 23,

		// options: Array
		//     Array of option objects, which contain keys for value and label.
		options: null,

		// _openEventHandlers: Array
		//     Array of event handlers returned by on() calls.  Empty when _open === false.
		//     Filled by _showPopup() and cleaned up by _hidePopup()
		_openEventHandlers: null,

		// _topics: Array
		//     Array of topic handlers returned by topic.subscribe().
		_topics: null,

		// value: String
		//     Lets the user set the starting value.  Not used except to set the starting value.
		//     Value must be a value on an option inside this.options for this to work.
		value: null,

		// selected: Object
		//     Points to the currently selected option object.
		selected: null,

		constructor: function(){
			// summary:
			//     constructor.

			this._singleton.instanceCounter++;

			//any non-literal objects that need to exist on a per-instance level
			//must be created inside a function like this
			this.options = [];
			this._openEventHandlers = [];
			this._topics = [];

			// when routes change, close me
			var handler = on(window, 'hashchange', lang.hitch(this, this._hidePopup));
			this._openEventHandlers.push(handler);

		},

		buildRendering: function(){
			// summary:
			//     Called by the widgetBase lifecycle.
			//     Creates various domNodes for use later on.
			//     this.domNode is created by widgetBase::buildRendering()
			//     which is called by this.inherited(arguments)

			this.inherited(arguments);

			//starts closed, the closed class applies rounded edges to the bottom 2 corners
			domClass.add(this.domNode, 'closed');

			//create some more nodes
			this.domNode.appendChild(
				this.labelNode = domConstruct.create('div', {
					'class': 'label'
				})
			);

			this.domNode.appendChild(
				this.arrowNode = domConstruct.create('input', {
					'class': 'arrow',
					'value': "▼ ",
					'readonly':'readonly'
				})
			);

			//this one is special, the popupDomNode has to be on the body for weird style issues
			//and (especially in mobile mode) it makes things easier.
			domWindow.body().appendChild(
				this.popupDomNode = domConstruct.create('div',{
					'class': 'popup',
					'style': 'visibility: hidden;'
				})
			);

			//add in a container node to the popupDomNode
			//for usability reasons, this node is an unordered list node
			//and the options themselves are list nodes.
			this.popupDomNode.appendChild(
				this.popupContainerNode = domConstruct.create('ul', {
					'class': 'popupContainer'
				})
			);

			//if this is only current instance and the singleton is empty, make dom nodes for it
			if(!this._singleton.fullscreenBackdropNode){
				domWindow.body().appendChild(
					this._singleton.fullscreenBackdropNode = domConstruct.create('div',{
						'id': 'popupBackdrop'
					})
				);
			}

			//listen for onclicks on the domNode
			on(this.domNode, 'click', lang.hitch(this,function(e){
				this._stopEventBubble(e);
				this.togglePopup();
			}));
		},

		destroy: function(){
			// summary:
			//     part of the widget lifecycle.  gets called when a widget needs to be destroyed.

			this._singleton.instanceCounter--;

			//if this is the last active instance destroy all the singleton objects as well
			if(this._singleton.instanceCounter === 0){

				//destroy all singleton elemetns as well...
				domWindow.body().removeChild(this._singleton.sizeCheckerNode);
				this._singleton.sizeCheckerNode = undefined;

				domWindow.body().removeChild(this._singleton.fullscreenBackdropNode);
				this._singleton.fullscreenBackdropNode = undefined;
			}

			//remove any hanging event handlers and topic subscriptions
			while(this._openEventHandlers.length > 0){
				this._openEventHandlers.pop().remove();
			}

			while(this._topics.length > 0){
				this._topics.pop().remove();
			}

			//let widgetBase clean up the rest
			this.inherited(arguments);
		},

		//read up on dojo getters and setters here:
		//  http://dojotoolkit.org/reference-guide/1.9/quickstart/writingWidgets.html#mapping-widget-attributes-to-domnode-attributes
		_setOptionsAttr: function(/*Object*/options){
			// summary:
			//     Sets this.options, determines new width of selectbox based on widest option text.
			//     Determines the appropiately selected option.
			// options: Array
			//     array of option objects
			
			this.options = options;

			//remove all children of the popup container
			domConstruct.empty(this.popupContainerNode);

			//need at least one option...
			if(this.options.length === 0){
				this.options.push({label: "", value: undefined});
			}

			//for each option...
			var i, selected, option, size, pixelWidth = 0;
			for(i=0;i<this.options.length;i++){
				option = this.options[i];

				//cannot abide unlabled options
				if(option.label === undefined || option.label === ""){
					option.label = "&nbsp;";
				}

				//compute the width and height of the label when rendered
				size = this._computeTextSize(option.label);

				//if this is the new widest label save it as such
				if(pixelWidth < size.w){
					pixelWidth = size.w;
				}

				//an option may be set as selected by setting 'selected' to true
				//or selection may be determined by setting a value on the select box object itself
				if(option.selected){
					selected = option;
				}
				if(this.value && option.value == this.value){
					selected = option;
				}

				//creates an option domNode (an <li>), adds it to the popupContainerNode
				//and saves a pointer to the option domNode into option.domNode
				this._createOption(option);
			}

			//if theres no selected option just pick the first one
			//this is why we need at least one option...
			if(!selected){
				selected = this.options[0];
			}

			//calls _setWidthAttr
			this.set('width',pixelWidth);

			//calls _setSelectedAttr
			this.set('selected',selected);

		},


		_createOption: function(/*Object*/option){
			// summary:
			//     Called by _setOptionsAttr to create an option tag and add it to the
			//     popup container node, and also saves the domNode into option.domNode.
			//     returns nothing.
			// option: Object
			//     object that should have lable and value keys.

			this.popupContainerNode.appendChild(option.domNode = domConstruct.create('li',{
				'class': 'popupItem',
				innerHTML: option.label,
				value: option.value,
				//lang.hitch forces the scope inside the function to be the select box
				//instead of the li node scope, and also passes in an extra parameter (option)
				onclick:  lang.hitch(this, function(/*Object*/option, /*Event*/e){
					this._stopEventBubble(e);
					this.set('selected', option);
					this._hidePopup();
				}, option)
			}));

		},

		_getValueAttr: function(){
			// summary:
			//     returns the value of the selected option.
			return this.get('selected').value;
		},

		_getSelectedAttr: function(){
			// summary:
			//     Returns the selected option
			return this.selected;
		},

		_setSelectedAttr: function(/*Object*/option){
			// summary:
			//     Marks an option as selected and unselects all other options.
			// option: Object
			//     the option to select.
			
			//i think this helps accessibility, talk with Dan Lewis about that
			domAttr.set(option.domNode, 'selected', true);

			//save this as the new canonical 'selected' object
			this.selected = option;

			//set the label of the select box...this could be broken out to a set('label', this.selected.label) call
			this.labelNode.innerHTML = this.selected.label;

			//remove the selected css class from all nodes
			var i;
			for(i = 0;i<this.options.length;i++){
				domClass.remove(this.options[i].domNode, 'selected');
			}

			//add the selected css class to the domNode of our option
			domClass.add(option.domNode, 'selected');
		},

		_setWidthAttr: function(/*Integer*/width){
			// summary:
			//     Used to set the width of the popup and select box.
			// width: Integer
			//     the width of the widest option label in pixels
			
			//we need to know what width to use if we switch from desktop mode to mobile and then back to desktop
			//when we do the final switch back to desktop we need to know how wide to make the popup
			this.popupWidth = width;

			//actually apply the width (plus some offset based on the arrow node width)
			var newWidth = width + this._offsetWidth;
			domStyle.set(this.domNode, 'width', newWidth +'px');
			domStyle.set(this.popupDomNode, 'width', newWidth +'px');
		},

		togglePopup: function(){
			// summary:
			//     Opens the popup if its closed.  Closes the popup if its open.

			if(this._open){
				this._hidePopup();
			}else{
				this._showPopup();
			}
		},

		_showPopup: function(){
			// summary:
			//     shows the popup, attaches some event listeners
			if(this._open){
				return;
			}
			this._open = true;

			var popupStyles, pos, popupPos, win, ptop, pwidth, pleft, newHeight,
			eventSieve = function(scroll, e){
				
				//console.log('checkEventLocation',pos);
				//console.log('event x:'+e.clientX + ', y: '+e.clientY);

				//the sieve
				//is this attached to an onScroll?
				if(scroll){
					//yup, so e must be a scroll event
					//scroll events inside the popup shouldn't close the popup...
					//any other scroll event should close the popup

					// is the click outside the popup domNode? then hide the popup
					var popupPos = domGeometry.position(this.popupDomNode);
					if(
						e.clientX < popupPos.x || e.clientX > popupPos.x + popupPos.w ||
						e.clientY < popupPos.y || e.clientY > popupPos.y + popupPos.h
					){
						this._hidePopup();
					}
				}else{
					//else this is a click event in which case we only care about whether
					//the main selectbox domnode was clicked.  each option has its own click event
					//so we dont need to worry about capturing clicks inside the popup

					var pos = domGeometry.position(this.domNode);
					//is the click outside the select domNode?
					if(
						e.clientX < pos.x || e.clientX > pos.x + pos.w ||
						e.clientY < pos.y || e.clientY > pos.y + pos.h
					){
						this._hidePopup();
					}
				}
			};


			if(this.isMobile()){
				//if we're mobile set the css accordingly
				domClass.add(this.popupContainerNode, 'mobile');

				//turn on the full screen backdrop behind the popup
				domStyle.set(this._singleton.fullscreenBackdropNode,{
					'visibility':'visible'
				});

				//get some dimmensions
				win = {
					w: window.innerWidth,
					h: window.innerHeight
				};

				//play with these numbers some...they're supposed to be setting the side of the popup
				//but its not entirely what i wanted...
				ptop = 0.15 * win.w;
				pleft = 0.15 * win.h;
				pwidth = win.w - pleft * 2;

				//popup width shouldn't be wider than the screen
				//not sure if this code ensures that though...
				if(this.popupWidth > pwidth){
					pwidth = (win.w - this.popupWidth) / 2;
				}

				//assoc array of styles to apply to the popup
				popupStyles = {
					'visibility': 'visible',
					'top': ptop + 'px',
					'left': pleft + 'px',
					'width': pwidth + 'px',
					'height': 'auto'
				};

				//aaaaand apply them
				domStyle.set(this.popupDomNode, popupStyles);

				//now that the dimmensions are applied, lets get the final computed dimmensions
				//so we can compare them to the window size
				popupPos = domGeometry.position(this.popupDomNode);

				//do some height calculations and if necessary add in a scroll bar to the popup
				if(window.innerHeight < popupPos.y + popupPos.h){
					newHeight = popupPos.h - (popupPos.y + popupPos.h - window.innerHeight);
					if(newHeight < 20){
						newHeight = 20;
					}
					domStyle.set(this.popupDomNode, {
						'height': newHeight + 'px',
						'overflow-y':'scroll'
					});
				}else{
					domStyle.set(this.popupDomNode, {
						'height': 'auto',
						'overflow-y':'visible'
					});
				}

				//sign up to listen for click anywhere...
				this._openEventHandlers.push(on(window, 'click', lang.hitch(this,eventSieve, false)));
				
			}else{
				//else we're in desktop mode

				//remove the rounding on the bottom of the select box
				domClass.remove(this.domNode, 'closed');

				//just in case the last time it was opened it was in mobile mode
				//lets make sure the mobile css class is removed
				domClass.remove(this.popupContainerNode, 'mobile');

				//build out some styles based on the position of the select box
				pos = domGeometry.position(this.domNode);

				popupStyles = {
					'visibility':'visible',
					'top': (pos.y + pos.h) + 'px',
					'left': pos.x + 'px'
				};
				//aaand apply
				domStyle.set(this.popupDomNode, popupStyles);

				//now that its applied we can do some height checks and apply a scroll bar as necessary
				popupPos = domGeometry.position(this.popupDomNode);
				if(window.innerHeight < popupPos.y + popupPos.h){
					//if we're goin off the screen...don't...and scroll bar
					newHeight = popupPos.h - (popupPos.y + popupPos.h - window.innerHeight);

					//gotta at least be tall enough for 1 option
					if(newHeight < 20){
						newHeight = 20;
					}

					domStyle.set(this.popupDomNode, {
						'height': newHeight + 'px',
						'overflow-y':'scroll'
					});
				}else if(this._popupMaxHeight < popupPos.h){
					//if its bigger than some arbitrary max height...don't...and scroll bar
					domStyle.set(this.popupDomNode, {
						'height': this._popupMaxHeight + 'px',
						'overflow-y':'scroll'
					});
				}else{
					//otherwise remove the scroll bar
					domStyle.set(this.popupDomNode, {
						'height': 'auto',
						'overflow-y':'visible'
					});
				}

				//listen for clicks anywhere
				this._openEventHandlers.push(on(window, 'click', lang.hitch(this,eventSieve, false)));

				//listen for scrolls anywhere, the true at the end tells the eventSieve fctn that its getting scroll not click events
				this._openEventHandlers.push(on(window, (!has("mozilla") ? "mousewheel" : "DOMMouseScroll"), lang.hitch(this,eventSieve, true)));
			}
		},

		_hidePopup: function(){
			// summary:
			//     closes the popup. Removes any event listeners attached by _showPopup

			if(!this._open){
				return;
			}
			this._open = false;

			//undo all the styles and classes that might have been set when it was opened
			domClass.add(this.domNode, 'closed');

			domStyle.set(this._singleton.fullscreenBackdropNode,{'visibility': 'hidden'});

			domStyle.set(this.popupDomNode,{'visibility': 'hidden'});

			//clean up any event handlers that were attached when it was opened
			while(this._openEventHandlers.length > 0){
				this._openEventHandlers.pop().remove();
			}
		},

		isMobile: function(){
			// summary:
			//     overridable at a higher level (where this.module is availabie)
			//     i would suggest setting this to this.module.getMode() === 'phone'
			return false;
		},

		_computeTextSize: function(/*String*/text){
			// summary:
			//     Uses a hidden domNode to check the pixel width and height of rendered text.

			//since javascript is single threaded we only need one of theses sizeChecker nodes
			//and all select boxes can use that one as needed
			//if we don't have a sizeChecker node in the singleton make one and put it there
			if(!this._singleton.sizeCheckerNode){
				this._singleton.sizeCheckerNode = domConstruct.create('div', {id: 'sizeChecker'});

				//doesn't matter where it goes, its hidden, and we know a body has to exist right?
				domWindow.body().appendChild(this._singleton.sizeCheckerNode);
			}

			//set the inner text using non-breaking spaces
			this._singleton.sizeCheckerNode.innerHTML = text.replace(/ /g, '&nbsp;');

			//get the newly computed size
			return {
				w: this._singleton.sizeCheckerNode.clientWidth,
				h: this._singleton.sizeCheckerNode.clientHeight
			};
		},

		_stopEventBubble: function(/*Object*/e){
			// summary:
			//     Stops an even from bubbling / propigating upwards any further.
			// e: Object
			//     The event that we want to stop propigation on.

			//Old IE crapiness requires this
			if (!e){
				e = window.event;
			}

			//IE9 & Other Browsers
			if (e.stopPropagation) {
				e.stopPropagation();
			}else{
				//IE8 and Lower
				e.cancelBubble = true;
			}
		},

		resize: function() {
			this._hidePopup();
		}

	});
});
