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
		'dojo/_base/window',
		'dojo/dom-attr',
		'dojo/dom-construct',
		'dojo/on',
		'dojox/mobile/Button',
		'dijit/_WidgetBase'
], function(declare, lang, win, domAttr, domConstruct, on, Button, WidgetBase) {
	return declare([WidgetBase], {

		baseClass: 'dialog',

		// blocking: boolean
		//     By default, the dialog can be closed by clicking on the background overlay.
		//     If blocking is true, the dialog can only be closed by pressing one of the buttons.
		blocking: false,

		// buttonsNode: DomNode
		//     Container for buttons.
		buttonsNode: null,

		// confirmButton: dojox/mobile/Button
		//     Button for confirmation action.
		confirmButton: null,

		// confirmLabel: String
		//     Label for confirmButton.
		confirmLabel: null,

		// hashHandler: Object
		//     Event handler for hash change
		hashHandler: null,

		// message: String
		//     Text displayed by dialog.
		message: null,

		// messageNode: DomNode
		//     DOM node containing message.
		messageNode: null,

		// onConfirm: function
		//     Callback function for when confirm button is pressed.
		onConfirm: null,

		// overlayNode: DomNode
		//     DOM node overlaying entire page that dims background while dialog is active.
		overlayNode: null,

		// overlayClickHandle: Object
		//     Dojo/on handle for overlayNode click event.
		overlayClickHandle: null,

		// state: String
		//     Represents the state of the dialog (open or closed)
		state: 'closed',

		// title: String
		//     Dialog title.
		title: 'Alert',

		// titleNode: DomNode
		//     DOM node containing title.
		titleNode: null,

		buildRendering: function() {
			this.inherited(arguments);

			domAttr.set(this.domNode, 'role', 'dialog');

			this.titleNode = domConstruct.create('div', {
				'class': 'dialogTitle'
			}, this.domNode);

			this.messageNode = domConstruct.create('div', {
				'class': 'dialogMessage'
			}, this.domNode);

			this.buttonsNode = domConstruct.create('div', {
				'class': 'dialogButtons'
			}, this.domNode);

			this.confirmButton = new Button({
				'class': 'button confirmButton',
				duration: 0,
				label: this.confirmLabel || 'OK',
				onClick: lang.hitch(this, function() {
					this.close();
				})
			});
			this.confirmButton.placeAt(this.buttonsNode);

			this.overlayNode = domConstruct.create('div', {
				'class': 'dialogOverlay'
			});
		},

		close: function(e) {
			if (this.state === 'closed') {
				return;
			}

			var history=window.history;

			// remove the dom node
			win.body().removeChild(this.domNode);
			win.body().removeChild(this.overlayNode);
			this.state = 'closed';

			// clean up route change handlers
			if (this.hashHandler) {
				this.hashHandler.remove();
				this.hashHandler = null;
			}

			// when closed programmatically and the history API is supported,
			// we need to pop the state so that the user doesn't have to hit
			// back twice
			if (history && history.pushState && history.state && history.state.open) {
				history.back();
				return;
			}
		},

		show: function() {
			if (this.state === 'open') {
				return;
			}

			var history=window.history, routeEvent;

			// add the dom node
			this.state = 'open';
			win.body().appendChild(this.overlayNode);
			win.body().appendChild(this.domNode);

			// prevent the dialog from remaining if the route changes
			// or the back button is pressed
			if (history && history.pushState) {
				// if we have history API, use pushState
				history.pushState({open: true}, '');
				routeEvent = 'popstate';
			} else {
				// otherwise fallback to hash events. coughcoughIEcough
				// side effect: hitting the back button in IE browsers that do
				// not support the history API removes the dialog,
				// but it also goes back to the previous route. whatevs.
				routeEvent = 'hashchange';
			}
			this.hashHandler = on(window, routeEvent, lang.hitch(this, this.close));
		},

		_setBlockingAttr: function(blocking) {
			this._set('blocking', blocking);

			if (blocking && this.overlayClickHandle) {
				this.overlayClickHandle.remove();
			}

			else if (!blocking && !this.overlayClickHandle) {
				this.overlayClickHandle = on(this.overlayNode, 'click', lang.hitch(this, function() {
					this.close();
				}));
			}
		},

		_setConfirmLabelAttr: function(confirmLabel) {
			this._set('confirmLabel', confirmLabel);

			this.confirmButton.innerHTML = confirmLabel;
		},

		_setMessageAttr: function(message) {
			this._set('message', message);

			this.messageNode.innerHTML = message;
		},

		_setOnConfirmAttr: function(onConfirm) {
			this._set('onConfirm', onConfirm);

			this.confirmButton.set('onClick', lang.hitch(this, function() {
				this.close();

				//wait for the close to clean out history before we redirect
				setTimeout(onConfirm,0);
			}));
		},

		_setTitleAttr: function(title) {
			this._set('title', title);

			this.titleNode.innerHTML = title;
		}

	});
});
