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

define(['dojo/dom-construct',
		'dojo/dom-class',
		'dojo/on',
		'dojo/query'
], function (domConstruct, domClass, on, query) {

	var toasterAttachPoint = document.getElementById('toasterContainer'),
		messages = {},
		count = 0,
		id = 0;
	
	var getMessageId = function() {
		return id++;
	};

	var createMessageDom = function(msg) {
		var root, cls;
		switch (msg.type) {
			case 'error':
				cls = 'toasterError';
				break;
			case 'information':
				cls = 'toasterInformation';
				break;
			case 'success':
				cls = 'toasterSuccess';
				break;
			case 'warning':
				cls = 'toasterWarning';
				break;
			default:
				console.warn('[toaster] Unknown type', msg.type);
				cls = '';
		}
		root = domConstruct.create('div', {
			'class': msg['class'] + ' ' + cls + ' closed'
		});
		domConstruct.create('p', {
			innerHTML: msg.text,
			'class': 'toasterText'
		}, root);
		domConstruct.create('div', {
			'class': 'toasterClose',
			innerHTML: '&times;',
			onclick: function(e) {
				deleteMessage(msg.id);
				e.stopPropagation();
			}
		}, root);
		return root;
	};

	var addMessage = function(msg) {
		registerMessage(msg);
		msg.dom = createMessageDom(msg);
		domConstruct.place(msg.dom, toasterAttachPoint);
		setTimeout(function() {
			domClass.remove(msg.dom, 'closed');
		}, 0);
		count++;
		if (msg.time > 0) {
			msg.timeoutId = setTimeout(function() {
				deleteMessage(msg.id);
			}, msg.time * 1000);
		}
		return msg;
	};

	var deleteMessage = function(id) {
		var msg;
		if (!messages.hasOwnProperty(id)) {
			console.warn('[toaster] Message not found', id);
			return;
		}
		msg = messages[id];
		console.log('[toaster] Destroying message', msg);
		domConstruct.destroy(msg.dom);
		if (msg.timeoutId !== undefined) {
			clearTimeout(msg.timeoutId);
		}
		delete messages[id];
		count--;
	};

	var messageExists = function(msg) {
		var k, m;
		for (k in messages) {
			if (messages.hasOwnProperty(k)) {
				m = messages[k];
				if (
					m.text === msg.text &&
					m.type === msg.type &&
					m.time === msg.time &&
					m.multiple === msg.multiple &&
					m['class'] === msg['class']
				) {
					return true;
				}
			}
		}
		return false;
	};

	var registerMessage = function(msg) {
		var id = getMessageId();
		msg.id = id;
		messages[id] = msg;
	};

	return {
		// description:
		//     The toaster library provides an interface to display messages on the screen.
		//
		//     The basic use is:
		//     | toaster.displayMessage({
		//     |     text: "Message text here.",
		//     |     type: 'error'
		//     | });
		//
		//     The displayMessage function returns a message ID which can be used with clearMessage
		//     to programmatically remove the message. There is also a clearMessages() function
		//     which clears all messages.


		displayMessage: function (message) {
			// summary:
			//     Displays a message. Returns a message id.
			// message: Object
			//     An object with the following properties:
			//     ** text (String)** -- The message text.
			//     ** type (String)** -- Type of message, either 'error', 'warning', 'success', or 'information' (default).
			//     ** time (Integer)** -- The timeout of the message, in seconds.  If -1 (default), then the message is persistent.
			//     ** multiple (Boolean)** -- True means multiple identical messages are allowed, false means duplicate messages are ignored.  Default is false.
			//     ** 'class' (String)** -- the css class to assign the message. Default is 'toasterMessage'

			// set defaults
			if (!message.text) {
				console.warn('[toaster] No message text', message);
			}
			message.type = message.type || 'information';
			message.time = message.time || -1;
			message['class'] = message['class'] || 'toasterMessage';

			if (!message.multiple && messageExists(message)) {
				console.warn('[toaster] Ignoring duplicate message', message);
				return;
			}

			console.log('[toaster] Message', message);
			message = addMessage(message);

			return message.id;
		},

		clearMessage: deleteMessage,

		clearMessages: function () {
			// summary:
			//     Clears all messages in active view and removes the toaster container
			console.log('[toaster] Clearing all messages');
			var k, a=[], m;
			for (k in messages) {
				if (messages.hasOwnProperty(k)) {
					a.push(messages[k]);
					deleteMessage(messages[k].id);
				}
			}
			while (a.length) {
				m = a.pop();
				deleteMessage(m.id);
			}
		}

	};
});
