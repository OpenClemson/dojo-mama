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

/*global Cufon*/
define(['dojo/_base/declare',
		'dojo/_base/kernel',
		'dojo/dom-class',
		'dojo/dom-style',
		'dojo/on',
		'dojo/query',
		'dojo/sniff',
		'dojo/topic',
		'dojo/request/script',
		'app/util/ProgressIndicator',
		'app/util/sniff'
], function(declare, kernel, domClass, domStyle, on, query, has, topic, script, ProgressIndicator, sniff) {

	// module:
	//     app/util/dom-utils

	// cufonGlyphMap: [private] Object
	//     Map of CSS selectors to icon font glyphs.
	var cufonGlyphMap = {
		// nav
		'.dmPrimaryNavItem_crudExample .dmPrimaryNavItemIcon': 'e606',  //  icon-user
		'.dmPrimaryNavItem_example .dmPrimaryNavItemIcon': 'e636',  //  icon-user
		'.dmSubNavBackButton div': 'e691',  // icon-back
		'.dmMenuBarPopupItem': 'e696',  // icon-list
		// custom classes
		'.footer .paw': 'e71c',  // icon-paw
		'.mapButton': 'e613',  // icon-map
		'.placesButton': 'e612',  // icon-location
		'.locationButton': 'e615',  // icon-location2
		'.prevMonthButton': 'e6d5',  // icon-arrow-left7
		'.nextMonthButton': 'e6d8',  // icon-uniE6D8
		// crud link arrows
		'.crudListView .dmListItem > a > .dmRightIcon': 'e6d0', // icon-arrow-right5
		// icon classes
		'.icon-user': 'e60d',
		'.icon-phone': 'e600',
		'.icon-mail': 'e604',
		'.icon-pencil': 'e606',
		'.icon-vcard': 'e610',
		'.icon-map': 'e613',
		'.icon-printer': 'e626',
		'.icon-chat': 'e61f',
		'.icon-graduation': 'e636',
		'.icon-camera': 'e62e',
		'.icon-calendar': 'e63f',
		'.icon-publish': 'e657',
		'.icon-suitcase': 'e652',
		'.icon-close': 'e678',
		'.icon-arrow-left': 'e6bd',
		'.icon-arrow-right': 'e6c0',
		'.icon-book': 'e637',
		'.icon-back': 'e691',
		'.icon-list': 'e696',
		'.icon-video': 'e69d',
		'.icon-screen': 'e660',
		'.icon-location': 'e612',
		'.icon-paw': 'e71c',
		'.icon-cross': 'e71d',
		'.icon-chevron-right-large': 'e6d8',
		'.icon-chevron-right-medium': 'e6d0',
		'.icon-chevron-right-small': 'e6d4',
		'.icon-play': 'e6ab',
		'.icon-pause': 'e6ac',
		'.icon-volume': 'e6b5',
		'.icon-sound': 'e6b6',
		'.icon-marker': 'e612',
		'.icon-resize-enlarge': 'e6b3',
		'.icon-resize-shrink': 'e6b4',
		'.icon-refresh': 'e68a',
		'.icon-chevron-left-large': 'e6d5',
		'.icon-chevron-left-small': 'e6d1',
		'.icon-chevron-left-medium': 'e6cd',
		'.icon-link': 'e628',
		'.icon-ellipsis': 'e6de',
		'.icon-dots': 'e6df',
		'.icon-dot': 'e6e0',
		'.icon-user-add': 'e60f',
		'.icon-cross3': 'e67e'
	};

	var cufonReplace = function() {
		// summary:
		//     Do Cufon replacements using the selectors and glyphs in cufonGlyphMap.
		console.log('cufonify!');
		var cufon = kernel.global.Cufon;
		var selector, content, nodeList, i, node;
		for (selector in cufonGlyphMap) {
			if (cufonGlyphMap.hasOwnProperty(selector)) {
				content = '&#x' + cufonGlyphMap[selector] + ';';
				nodeList = query(selector);
				for (i=0; i < nodeList.length; ++i) {
					node = nodeList[i];
					node.innerHTML = content;
					domClass.add(node, 'cufon');
				}
				cufon.replace(selector);
			}
		}
		cufon.now();
	};

	var DomUtils = declare([], {
		// summary:
		//     Utilities for intercepting external links and replacing content rendered
		//     in an icon font with Cufon equivalents.

		// externalLinkSignals: [private] Object
		//     dojo/on handles to external link click handlers
		//externalLinkSignals: null,

		/*wrapExternalLinks: function() {
			// summary:
			//     Add click handlers to external links (those with a target of "_blank") to
			//     override the default behavior and open their address in an iframe instead.
			// tags:
			//     public

			// The native wrappers handle this by opening a new webview with the external
			// content. So no need to use an iframe.
			if (!has('nativewrapper')) {

				// Remove old click handlers
				if (this.externalLinkSignals) {
					var i;
					for (i = 0; i < this.externalLinkSignals.length; i++) {
						this.externalLinkSignals[i].remove();
					}
				}

				// Bind click handlers to all external links
				this.externalLinkSignals = query('a[target="_blank"]').on('click', function(e) {

					// Open clemson.edu links in an iframe
					//if (this.href.match(/^https?:\/\/([^\?]*?){1}clemson\.edu/)) {

					e.preventDefault();

					var container = new LinkContainer({
						title: this.title,
						url: this.href
					});
					container.startup();
					container.show();
				});
			}
		},*/

		cufonify: function() {
			// summary:
			//     Replace icon font content with its Cufon equivalent.
			// tags:
			//     public

			// Only do this on Windows Phones
			if (!sniff.isWindowsPhone()) {
				return;
			}

			// If Cufon has not already been defined, must pull in the Cufon engine and
			// font definition before doing the replacement
			var cufon = kernel.global.Cufon;
			if (cufon === undefined) {
				// TODO use dojo/promise/all to do these simultaneously!
				script.get('static/cufon-yui.min.js').then(function() {
					script.get('static/cufon-font.min.js').then(function() {
						cufonReplace();
					});
				});
			}
			else {
				cufonReplace();
			}

		},

		injectNavSpinners: function(/*dojo-mama/Layout*/ layout) {
			// summary:
			//     Add click handlers to primary nav items to display spinners while the module
			//     is loading. The spinner replaces the nav item's module icon and is displayed
			//     from when the nav item is clicked until the module activates.
			// tags:
			//     public

			// Function to create click handler function for a specific nav item.
			var buildNavItemClickHandler = function(navItemLinkNode) {
				return function() {

					// Determine which module this nav item links to.
					var linkedModule = navItemLinkNode.href.substr(navItemLinkNode.href.lastIndexOf('/') + 1);

					var spinner = null;
					var navItemIconNode = query('.dmPrimaryNavItemIcon', navItemLinkNode)[0];

					// When the linked module starts loading for the first time, hide the nav item's
					// icon and replace it with a spinner.
					var startLoadingHandle = topic.subscribe('/dojo-mama/startLoadingModule', function(moduleName) {
						if (moduleName === linkedModule) {

							navItemIconNode.style.visibility = 'hidden';

							if (layout.mode === 'tablet') {
								spinner = new ProgressIndicator({
									size: 35,
									startSpinning: true
								});
							}
							else {
								spinner = new ProgressIndicator({
									size: 28,
									startSpinning: true
								});
							}
							domClass.add(spinner.domNode, 'mblProgWhite');
							spinner.domNode.style.zIndex = 2;
							spinner.placeAt(navItemLinkNode, 'first');
							spinner.startup();
						}
					});

					// When the linked module is done loading, remove the spinner and restore the icon
					var doneLoadingHandle = topic.subscribe('/dojo-mama/doneLoadingModule', function(moduleName) {
						if (moduleName === linkedModule) {
							startLoadingHandle.remove();
							doneLoadingHandle.remove();
							if (spinner) {
								spinner.stop();
								spinner.destroy();
							}
							navItemIconNode.style.visibility = 'visible';
						}
					});
				};
			};

			// Apply click handler to each nav item.
			var navItemNodes = query('.dmPrimaryNav li > a');
			var i;
			for (i = 0; i < navItemNodes.length; i++) {
				on(navItemNodes[i], 'click', buildNavItemClickHandler(navItemNodes[i]));
			}
		},

		onTransitionEnd: function(/*Object*/ node, /*Function*/ callback, /*Integer|Float|String?*/ timeout) {
			// summary:
			//   Callback when a node's transition end event fires. Returns a dojo/on return value.
			//   Computed style is calculated only the first time this method is called to determine
			//   a node's transition duration. If the transition duration changes, the previous
			//   event handler should be removed and this method should be called again.
			// node:
			//   The DOM node firing the event
			// callback:
			//   The callback to fire onTransitionEnd
			// timeout:
			//   A timeout value used to fallback for browsers that do not support onTransitionEnd.
			//   Integers are intepreted as milliseconds. Strings such as '0.2s' and
			//   '200ms' are also acceptable. If not provided, the callback will
			//   not be registered if the DOM node's transition duration cannot be computed.
			// tags:
			//   public

			var e, computedStyle, transitionDuration, length, trim, multiplier;

			computedStyle = domStyle.getComputedStyle(node);
			if (has('webkit')) {
				e = 'webkitTransitionEnd';
				transitionDuration = computedStyle.webkitTransitionDuration;
			} else if (has('mozilla')) {
				e = 'transitionend';
				transitionDuration = computedStyle.mozTransitionDuration;
			} else if (has('ie')) {
				e = 'msTransitionEnd';
				transitionDuration = computedStyle.msTransitionDuration;
			} else if (has('opera')) {
				e = 'oTransitionEnd';
				transitionDuration = computedStyle.oTransitionDuration;
			}

			transitionDuration = transitionDuration || computedStyle.transitionDuration || timeout;

			if (transitionDuration === String(transitionDuration)) {
				if (+transitionDuration) {
					transitionDuration = +transitionDuration;
				} else {
					length = transitionDuration.length;
					trim = 0; multiplier = 1;
					if (transitionDuration.slice(-2) === 'ms') {
						trim = 2;
					} else if (transitionDuration.slice(-1) === 's') {
						trim = 1;
						multiplier = 1000;
					} else {
						console.warn('Weird transition duration', transitionDuration);
					}
					transitionDuration = (+transitionDuration.substring(0, length - trim)) * multiplier;
				}
			}

			if (!transitionDuration) {
				return;
			}

			console.log('On end transition duration (ms):');
			console.log(transitionDuration);
			
			var createTransitionEndHandler = function() {
				// remember if we finished or not
				var done = false, handler;
				// create the event handler
				handler = function(e) {
					// only execute once per event
					if (!done) {
						done = true;
						callback(e);
					}
				};
				// fall back to setTimeout if needed
				setTimeout(handler, transitionDuration);
				// return the event handler function
				return handler;
			};

			return on(node, e, createTransitionEndHandler());
		}

	});

	return new DomUtils();
});
