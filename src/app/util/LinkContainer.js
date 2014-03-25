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
		'dojo/dom-class',
		'dojo/dom-construct',
		'dojo/dom-geometry',
		'dojo/dom-style',
		'dojo/fx',
		'dojo/on',
		'dojox/mobile/Pane'
], function(declare, lang, domClass, domConstruct, domGeom, domStyle, fx, on, Pane) {

	// module:
	//     app/util/LinkContainer

	return declare([Pane], {
		// summary:
		//     Container to view external links in an iframe that fills the window.

		'class': 'linkContainer hidden',
		// backButtonSignal: [private] Object
		//     dojo/on signal for back button to close container
		backButtonSignal: null,
		// iframe: [private] Object
		//     The iframe the address is loaded in
		iframeNode: null,
		// openButtonSignal: [private] Object
		//     dojo/on signal for share button to open link in new tab
		openButtonSignal: null,
		// title: String
		//     The title to show in the top bar
		title: null,
		// titleNode: [private] Object
		//     The DOM node for the title in the top bar
		titleNode: null,
		// url: String
		//     The address to load
		url: null,

		buildRendering: function() {
			this.inherited(arguments);

			var header = domConstruct.create('div', {
				'class': 'header'
			}, this.domNode);

			// Back button
			var backButton = domConstruct.create('a', {
				'class': 'backButton',
				'title': 'Close'
			}, header);

			this.backButtonSignal = on(backButton, 'click', lang.hitch(this, function(e) {
				e.preventDefault();
				this.close();
			}));

			domConstruct.create('div', {
				'class': 'icon-back'
			}, backButton);

			// Title
			this.titleNode = domConstruct.create('div', {
				'class': 'title'
			}, header);

			// Open button
			var openButton = domConstruct.create('a', {
				'class': 'openButton',
				'title': 'Open in new tab'
			}, header);

			this.openButtonSignal = on(openButton, 'click', lang.hitch(this, function(e) {
				e.preventDefault();

				this.close();
				window.open(this.get('url'), '_blank');
			}));

			domConstruct.create('div', {
				'class': 'icon-export'
			}, openButton);

			// iFrame
			var frameWrapper = domConstruct.create('div', {
				'class': 'frameWrapper'
			}, this.domNode);

			this.iframeNode = domConstruct.create('iframe', {}, frameWrapper);

			document.body.appendChild(this.domNode);
		},

		destroy: function() {
			if (this.backButtonSignal) {
				this.backButtonSignal.remove();
			}
			if (this.openButtonSignal) {
				this.openButtonSignal.remove();
			}

			this.inherited(arguments);
		},

		_setUrlAttr: function(/*String*/ url) {
			this._set('url', url);
		},

		_setTitleAttr: function(/*String*/ title) {
			this._set('title', title);
			this.titleNode.innerHTML = title;
		},

		show: function() {
			// summary:
			//     Fills the window with the link container. In mobile view, animates the transition.

			if (!this.get('url')) {
				return;
			}

			// In phone view, show a transition
			if (domClass.contains(document.documentElement, 'dj_phone')) {
				domStyle.set(this.domNode, {
					top: '100%'
				});
				domClass.remove(this.domNode, 'hidden');

				fx.slideTo({
					duration: 250,
					onEnd: lang.hitch(this, function() {
						this.iframeNode.src = this.get('url');
					}),
					node: this.domNode,
					top: '0',
					units: 'px'
				}).play();
			}

			else {
				domClass.remove(this.domNode, 'hidden');
				this.iframeNode.src = this.get('url');
			}
		},

		close: function() {
			// summary:
			//     Closes the container by destroying the widget. In mobile view, animates the transition.

			// In phone view, show a transition
			if (domClass.contains(document.documentElement, 'dj_phone')) {
				var box = domGeom.getContentBox(document.body);
				fx.slideTo({
					duration: 250,
					onEnd: lang.hitch(this, function() {
						this.destroy();
					}),
					node: this.domNode,
					top: box.h,
					units: 'px'
				}).play();
			}
			else {
				this.destroy();
			}
		}
	});
});
