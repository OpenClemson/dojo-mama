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
		'dojo/_base/kernel',
		'dojo/_base/lang',
		'dojo/topic',
		'dojox/mobile/EdgeToEdgeList',
		'dojo-mama/Module',
		'dojo-mama/views/ModuleScrollableView',
		'dojo-mama/util/BaseListItem',
		'dojo-mama/util/LinkListItem',
		'app/util/CachedXHR'
], function(declare, kernel, lang, topic, EdgeToEdgeList, Module, ModuleScrollableView, BaseListItem, LinkListItem, CachedXHR) {
	return declare([Module], {

		feedURL: null,

		list: null,

		postCreate: function() {
			this.inherited(arguments);

			this.rootView = new ModuleScrollableView({
				route: '/',

				activate: lang.hitch(this, function() {
					if (!this.feedURL) {
						return;
					}

					CachedXHR.get(this.feedURL).then(
						lang.hitch(this, function(response) {
							var i, li, link;
							this.list.destroyDescendants();
							for (i = 0; i < response.links.length; i++) {
								link = response.links[i];

								li = new LinkListItem({
									text: link.title,
									href: link.url,
									hrefTarget: '_blank'
								});
								this.list.addChild(li);
								li.startup();
							}
						}),
						lang.hitch(this, function(err) {
							console.error(err);
							this.list.destroyDescendants();
							var li = new BaseListItem({
								text: kernel.global.dmConfig.networkErrorMessage
							});
							this.list.addChild(li);
							li.startup();
						}));
				})
			});

			this.list = new EdgeToEdgeList();
			this.list.placeAt(this.rootView.containerNode);

			this.registerView(this.rootView);
		},

		activate: function() {
			this.inherited(arguments);

			if (this.hasOwnProperty('selectedPrimaryNavItem')) {
				topic.publish('/dojo-mama/updateSubNav', {
					back: '/' + this.selectedPrimaryNavItem
				});
			}
		}

	});
});
