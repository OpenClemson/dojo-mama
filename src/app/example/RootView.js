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
		'dojo-mama/views/ModuleScrollableView'
], function(declare, domConstruct, ModuleScrollableView) {
	return declare([ModuleScrollableView], {

		'class': 'exampleView',
		route: '/',
		title: 'Example View',

		n: 0,

		buildRendering: function() {
			this.inherited(arguments);

			var h1 = domConstruct.create('h1', {
				innerHTML: 'Hello!'
			}, this.domNode);

			this.dynamicContent = domConstruct.create('div', {
				'class': 'dynamicContent'
			}, this.domNode);
		},

		/* activate gets called each time the view routes */
		activate: function(e) {

			this.n++;
			var routerEvent = JSON.stringify(e);

			var pre = domConstruct.create('p', {
				innerHTML: this.n + ') ' + routerEvent
			}, this.dynamicContent);

		}

	});
});
