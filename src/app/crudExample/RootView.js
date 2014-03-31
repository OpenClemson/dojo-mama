/*
dojo-mama: a JavaScript framework
Copyright (C) 2014 Omnibond Systems LLC

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
		'dojo/dom-construct',
		'dojo/on',
		'dojo/topic',
		'dojo-mama/views/ModuleListView',
		'app/util/error-utils',
		'app/util/identity'
], function(declare, lang, domConstruct, on, topic, ModuleListView, errorUtils, identity) {
	return declare([ModuleListView], {

		'class': 'rootView',

		postCreate: function() {
			var btn, that=this;
			this.inherited(arguments);
			this.list.domNode.style.display = 'none';
			this.loginMessage = domConstruct.create('div', {
				'class': 'loginMessage',
				style: 'display: none'
			}, this.domNode);
			domConstruct.create('h4', {
				innerHTML: 'Log in.'
			}, this.loginMessage);
			btn = domConstruct.create('button', {
				'class': 'button',
				innerHTML: 'Log In',
				onclick: function() {
					identity.getUser(true).then(
						that.checkUser,
						that.loginError
					);
				}
			}, this.loginMessage);
		},

		activate: function() {
			this.inherited(arguments);
			identity.getUser().then(
				lang.hitch(this, this.checkUser),
				lang.hitch(this, this.requestLogin)
			);
		},

		checkUser: function(user) {
			console.log('Checking user', user);
			if (user && user.authenticated) {
				console.log('showing module list');
				this.loginMessage.style.display = 'none';
				this.list.domNode.style.display = 'block';
			} else {
				this.requestLogin();
			}
		},

		loginError: function(err) {
			errorUtils.handleNetworkError(err, true);
		},

		requestLogin: function() {
			this.loginMessage.style.display = 'block';
			this.list.domNode.style.display = 'none';
		}

	});
});
