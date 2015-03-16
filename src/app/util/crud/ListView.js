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
		'dojo/dom-class',
		'dojo/dom-construct',
		'dojo/request/xhr',
		'app/layout/layout',
		'app/util/EdgeToEdgeList',
		'dojox/mobile/Pane',
		'app/util/LinkListItem',
		'app/util/BaseListItem',
		'app/util/crud/View',
		'app/util/crud/DisplayFieldMixin',
		'app/util/crud/TextMixin'
], function(declare, lang, domClass, domConstruct, xhr, layout, EdgeToEdgeList, Pane,
		LinkListItem, BaseListItem, View,DisplayMixin, TextMixin) {
	
	// module:
	//     app/util/crud/ListView

	return declare([View, DisplayMixin, TextMixin], {
		// summary:
		//     A root list view for CRUD modules

		// route: String
		//     The dojo-mama route
		route: '/',
		// viewType: String
		//     The type of this view, used with nls resources (app/util/crud/TextMixin)
		viewType: 'List',
		'class': 'crudListView',

		buildRendering: function() {
			// summary:
			//     Build out the static view list content
			this.inherited(arguments);

			var heading = this.getText('beforeList');
			if (heading) {
				domConstruct.create('p', {
					innerHTML: heading,
					'class': 'beforeList'
				}, this.containerNode);
			}

			this.content = new Pane();
			this.content.startup();
			this.content.placeAt(this.domNode);
		},

		activate: function(/*Object*/ e) {
			// summary:
			//     Activate the view after routing, building out dynamic content
			// e:
			//     The dojo/router event
			this.inherited(arguments);
			domClass.add(this.domNode, 'listView');

			// destroy existing list view content
			this.content.destroyDescendants();
			domConstruct.empty(this.content.domNode);
			delete this.lists;

			layout.startProgress();

			// build out the list view
			this.module.getData().then(lang.hitch(this,
				function(parser) {
					this._handle_getData(parser);
				}
			), function(err){
				layout.stopProgress();
			});
		},

		deactivate: function() {
			this.inherited(arguments);
			domClass.remove(this.domNode, 'listView');
		},

		_handle_getData: function(parser) {
			// Summary: 
			//     the callback for this.module.getData in activate.
			// data:
			//     The data that getData returns.

			//console.log('data received', data);
			var
				typeIterator = parser.getTypeIterator(),
				type,
				itemIterator = parser.getItemIterator(),
				item,  // a particular data item
				lists = {},  // a EdgeToEdgeLists by type
				list,  // a single EdgeToEdge list
				listItem,
				displayable = parser.isDisplayable(),
				editable = parser.isEditable(),
				i, li, href, field,fieldId,
				beforeText = this.getText('beforeText'),
				afterText = this.getText('afterText');

			layout.stopProgress();

			this.lists = lists;

			if(beforeText){
				domConstruct.create('p', {
					'class': 'beforeText',
					innerHTML: beforeText
				}, this.content.domNode);
			}

			// create lists
			while((type = typeIterator.next()) !== false){
				lists[type.getId()] = this._createList(type);
			}
			
			// populate each list
			while((item = itemIterator.next()) !== false){

				if(displayable){
					href = this.module.getRouteHref('/display/') + encodeURIComponent(item.getId());
				}else if(editable){
					href = this.module.getRouteHref('/edit/') + encodeURIComponent(item.getId());
				} else {
					href="NONE";
				}

				var rightTextAttr = this.getRightTextAttr(item);
				if (rightTextAttr === "BLANK") {
					field="BLANK";
				} else {
					field = item.getFieldById(rightTextAttr);
					if(field === false){
						field = item.getValueById(rightTextAttr);
					}
				}
				listItem = this._createListItem(href, item, field);
				// Check if multiple list items were returned and handle appropriately
				if(Array.isArray(listItem)) {
					for(i = 0; i < listItem.length; i++) {
						lists[item.getType()].addChild(listItem[i]);
					}
				} else {
					lists[item.getType()].addChild(listItem);
				}
			}

			if(afterText){
				domConstruct.create('div',{'class':'afterText',innerHTML: afterText},this.content.domNode);
			}
		},

		getRightTextAttr: function(/*Object*/item){
			return this.module.listItemRightText;
		},

		_createList: function(/*Object*/type){
			// Summary: 
			//     Overridable helper function that is used to create a list of items
			//     for each type.
			// type:
			//     An object that tells us the lable to go above this list of items

			var list,href,controlDiv;
			list = new EdgeToEdgeList();
			//lists[listName] = list;
			domConstruct.create('h2', {
				innerHTML: type.getCategoryLabel(),
				style: 'clear: both'
			}, this.content.domNode);
			list.startup();
			list.placeAt(this.content.domNode);
			if (type.isCreatable()) {
				this.content.domNode.appendChild(controlDiv = domConstruct.create('div',{
					'class': 'buttonBar'
				}));
				href = this.module.getRouteHref('/create/' + type.getId());
				domConstruct.create('a', {
					href: href,
					innerHTML: type.getCreateLabel(),
					'class': 'button'
				}, controlDiv);
			}
			return list;
		},

		_createListItem: function(/*String*/href,/*Object*/item,/*Object*/field){
			// Summary:
			//     Overridable helper function to create a list item 
			//     for each item we got from the server.
			// href:
			//     the route to go to when the user clicks on this list item
			// item:
			//     the item that we're making a listItem for
			// field:
			//     the field thats associated with the attribute name stored in 
			//     this.module.listItemRightText.  We need this to call displayField and 
			//     have it know what type of data its formatting.
			var rightText, props, li;

			if(typeof field === "string"){
				rightText = field;
			}else{
				rightText = this.displayField(field);
			}
			if(rightText === "BLANK") {
				rightText = "";
			} else if(rightText === "" || rightText === undefined){
				rightText = "[Empty]";
			}
			props = {
				text: item.getValueById('label'),
				rightText: rightText
			};
			if(href === "NONE") {
				li = new BaseListItem(props);
			} else {
				props.href = href;
				li = new LinkListItem(props);
			}
			li.startup();
			return li;
		}

	});
});
