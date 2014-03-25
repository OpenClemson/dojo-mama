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
		'dojo/cookie',
		'dojo/dom-attr',
		'dojo/has',
		'dojo/on',
		'dojo/query',
		'app/util/ConfirmationDialog'
], function(declare, cookie, domAttr, has, on, query, ConfirmationDialog) {

	// module:
	//     app/util/Wrapper

	// Add to dojo/has to determine if this is run in a native wrapper. The native apps
	// set a cookie called 'myClemsonAppCookie'.
	has.add('nativewrapper', function() {
		var hasWrapper = false;


		var cookieOS = cookie('myClemsonAppCookie');

		if (cookieOS) {
			// The cookie from Android has quotes around the value for some reason
			cookieOS = cookieOS.replace(/^\"/, '').replace(/\"$/, '');
		}

		if (cookieOS && has(cookieOS)) {
			hasWrapper = true;
		}

		return hasWrapper;
	});

	var Wrapper = declare([], {
		// summary:
		//     Utility functions related to the native app wrappers

		wrapContactLink: function(/*Object*/ domNode, /*Object*/ contact) {
			// summary:
			//     Display a confirmation dialog before following a tel: or mailto: link.
			//     Safari does this already, so our own dialog should only be shown inside
			//     the native wrapper, where the default dialog is prevented.
			//  domNode: Object
			//     The link
			//  contact: Object
			//     A contact info object

			on(domNode, 'click', function(e) {
				e.preventDefault();

				var dialog = new ConfirmationDialog({
					title: contact.value
				});

				if (contact.type == 'phone') {
					dialog.set('message', 'Leave app and call this number?');
					dialog.set('confirmLabel', 'Call');
					dialog.set('onConfirm', function() {
						window.location = 'tel:' + contact.value;
					});
				}

				else if (contact.type == 'email') {
					dialog.set('message', 'Leave app and email this address?');
					dialog.set('confirmLabel', 'Email');
					dialog.set('onConfirm', function() {
						window.location = 'mailto:' + contact.value;
					});
				}

				dialog.show();
			});
		},

		confirmExternalLinks: function(/*Object*/ domNode) {
			// summary:
			//     Display a confirmation dialog before following a tel: or mailto: link.
			//     Safari does this already, so our own dialog should only be shown inside
			//     the native wrapper, where the default dialog is prevented.
			// domNode: Object
			//     A DOM node whose children will be searched for tel/mailto links.

			query('a[href^="tel"], a[href^="mailto"]', domNode).forEach(function(link) {
				on(link, 'click', function(e) {
					e.preventDefault();

					var href = domAttr.get(link, 'href');

					var value = href.substr(href.indexOf(':') + 1);

					var dialog = new ConfirmationDialog({
						title: value
					});

					if (href.match(/^tel:/)) {
						dialog.set('message', 'Leave app and call this number?');
						dialog.set('confirmLabel', 'Call');
						dialog.set('onConfirm', function() {
							window.location = 'tel:' + value;
						});
					}

					else if (href.match(/^mailto:/)) {
						dialog.set('message', 'Leave app and email this address?');
						dialog.set('confirmLabel', 'Email');
						dialog.set('onConfirm', function() {
							window.location = 'mailto:' + value;
						});
					}

					dialog.show();
				});
			});
		}

	});

	return new Wrapper();
});
