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
		'dojo/_base/array',
		'dojo/dom-class',
		'dojo/dom-attr',
		'dojo/dom-construct',
		'dojo/has',
		'dojox/mobile/EdgeToEdgeList',
		'dojo-mama/util/LinkListItem',
		'dojo-mama/Module',
		'dojo-mama/views/ModuleScrollableView',
		'app/util/CachedXHR'
], function(declare, array, domClass, domAttr, domConstruct, has, EdgeToEdgeList, LinkListItem, Module, ModuleScrollableView, CachedXHR) {
	return declare([Module], {

		'class': 'helpModule',

		postCreate: function() {
			this.inherited(arguments);

			this.rootView = new ModuleScrollableView({
				'class': 'helpView',
				route: '/'
			});

			this.registerView(this.rootView);

			domConstruct.create('h4', {
				innerHTML: 'Browser Support'
			}, this.rootView.containerNode);

			domConstruct.create('p', {
				innerHTML: 'For the best experience, we recommend the latest version of one of the following browsers:'
			}, this.rootView.containerNode);

			var browserList = new EdgeToEdgeList({
				'class': 'browserList'
			});
			browserList.addChild(new LinkListItem({
				text: 'Google Chrome',
				rightText: '(Windows, OS X, iOS, Android 4.0+)',
				href: 'http://www.google.com/chrome',
				hrefTarget: '_blank'
			}));
			browserList.addChild(new LinkListItem({
				text: 'Apple Safari',
				rightText: '(Windows, OS X, iOS 6+)',
				href: 'http://support.apple.com/downloads/#safari',
				hrefTarget: '_blank'
			}));
			browserList.addChild(new LinkListItem({
				text: 'Mozilla Firefox',
				rightText: '(Windows, OS X)',
				href: 'http://www.mozilla.org/en-US/firefox/new/',
				hrefTarget: '_blank'
			}));
			browserList.addChild(new LinkListItem({
				text: 'Microsoft Internet Explorer 9+',
				rightText: '(Windows, Windows Phone 7+)',
				href: 'http://www.microsoft.com/en-us/download/internet-explorer-10-details.aspx',
				hrefTarget: '_blank'
			}));
			browserList.placeAt(this.rootView.containerNode);

			array.forEach(browserList.getChildren(), function (li) {
				domClass.add(li.rightIconNode, 'icon-link');
			});

			domConstruct.create('h4', {
				innerHTML: 'Credits'
			}, this.rootView.containerNode);

			domConstruct.create('p', {
				innerHTML: 'Entypo pictograms by Daniel Bruce &mdash; <a href="http://www.entypo.com" target="_blank">www.entypo.com</a>.'
			}, this.rootView.containerNode);

		}
	});
});
