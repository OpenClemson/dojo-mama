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
		'dojo/dom-class',
		'dojo/dom-style',
		'dojo/has',
		'dojo/on',
		'dojo/topic',
		'dojo/query',
		'dojo/window',
		'app/layout/NotFoundMixin'
], function(declare, lang, domClass, domStyle, has, on, topic, query, win, NotFoundMixin) {

	var Layout = declare([NotFoundMixin], {
		// summary:
		//     A singleton; hooks into the application layout
		//     and provides methods to interact with the layout

		htmlNode: null,
		layoutNode: null,
		mainContentNode: null,
		mobileBreakpoint: 1024,
		mode: '',

		startup: function() {
			this.inherited(arguments);

			// get dom node references
			this.htmlNode = document.getElementsByTagName('html')[0];
			this.layoutNode = query('body > .layout')[0];
			this.mainContentNode = query('#main')[0];
			
			// listen to resize events
			this.setMode();
			on(window, 'resize, orientationchange', lang.hitch(this, this.setMode));

			// sniff client
			if (!has('touch')) {
				domClass.add(this.htmlNode, 'no_touch');
			}
			if (has('ios')) {
				domClass.add(this.htmlNode, 'ios');
			}
			if (has('android')) {
				domClass.add(this.htmlNode, 'android');
			}
			if (has('ie') < 10) {
				domClass.add(this.htmlNode, 'ie-old');
			}

			// show the layout when the first view routes
			var handles = [];
			var stopLoading = function() {
				this.showLayout();
				while (handles.length) {
					handles.shift().remove();
				}
			};
			handles.push(topic.subscribe('/dojo-mama/activateView', lang.hitch(this, stopLoading)));
			handles.push(topic.subscribe('/dojo-mama/routeError', lang.hitch(this, stopLoading)));
		},

		addView: function(view) {
			this.removeChildren(this.mainContentNode);
			view.domNode.style.opacity = 0;
			this.mainContentNode.appendChild(view.domNode);
			// scroll to top
			this.mainContentNode.scrollTop = 0;
			setTimeout(function() {
				view.domNode.style.opacity = 1;
			}, 0);
		},

		getLayoutNode: function() {
			return this.layoutNode;
		},

		getMode: function() {
			return this.mode;
		},

		hideLayout: function() {
			domStyle.set(this.layoutNode, 'visibility', 'hidden');
		},

		reflowCSS: function(node) {
			if (!node) {
				node = this.mainContentNode;
			}
			node.style.display = 'none';
			setTimeout(function() {
				node.style.display = '';
			}, 0);
		},

		removeChildren: function(node) {
			while (node.firstChild) {
				node.removeChild(node.firstChild);
			}
		},

		setMode: function() {
			var dims = win.getBox(),
				mode = (dims.w > this.mobileBreakpoint) ? 'desktop' : 'mobile';
			if (mode !== this.mode) {
				domClass.replace(this.htmlNode, mode, this.mode);
				this.mode = mode;
				topic.publish('/app/layout/resize', mode);
			}
		},

		showLayout: function() {
			domStyle.set(this.layoutNode, 'visibility', 'visible');
		},

		updateTitle: function(title) {
			console.warn('Not implemented');
		}

	});

	return new Layout();

});
