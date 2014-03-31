/*
dojo-mama: a JavaScript framework
Copyright (C) 2014 Omnibond Systems, LLC

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
		'dojo/dom-class',
		'dojo/request/xhr',
		'dojo/topic',
		'dojo-mama/util/EdgeToEdgeList',
		'dojox/mobile/Pane',
		'dojo-mama/util/BaseListItem',
		'dojo-mama/util/toaster',
		'app/util/crud/View',
		'app/util/crud/DisplayFieldMixin',
		'app/util/crud/TextMixin',
		'app/util/ConfirmationDialog'
], function(declare, lang, domConstruct, domClass, xhr, topic, EdgeToEdgeList, Pane,
		BaseListItem, toaster, View, DisplayFieldMixin, TextMixin, ConfirmationDialog) {
	
	// module:
	//     app/util/crud/DisplayView

	return declare([View, DisplayFieldMixin,TextMixin], {
		// summary:
		//     A display view for CRUD data items

		// route: String
		//     The dojo-mama/views/ModuleScrollableView route
		route: '/display/:id',

		// viewType: String
		//     The type of this view, used with nls resources (app/util/crud/TextMixin)
		viewType: 'Display',

		postCreate: function() {
			// summary:
			//     Build out the static view list content
			this.inherited(arguments);

			this.content = new Pane();
			this.content.startup();
			this.content.placeAt(this.domNode);
		},

		activate: function(/*Object*/ e) {
			// summary:
			//     Activate the view after routing and call buildView
			// e:
			//     The dojo/router event
			this.inherited(arguments);
			this.buildView(e);
		},

		buildView: function(e) {
			// summary:
			//     Build the view after routing
			// e:
			//     The dojo/router event

			var objectId = decodeURIComponent(e.params.id);
			
			// Destroy existing list view content
			this._clearView();

			// Build out a list of items
			this.module.getData().then(lang.hitch(this, this._handleData, objectId,e));
		},

		_clearView: function(){
			// summary:
			//     Clears out the current decendents so that buildView 
			//     has a clean slate to work with.

			this.content.destroyDescendants();
			domConstruct.empty(this.content.domNode);
		},

		_handleData: function(/*String*/objectId,/*Object*/e,/*Object*/parser) {
			// summary:
			//     Catches the response of this.module.getData().
			// objectId: 
			//     The objectId of the item we're looking for.
			// e:
			//     The dojo/router event
			// parser:
			//     A data parser with the response data already loaded into it
			
			var item = parser.getItemById(objectId);
			if(!item){
				console.warn('cannot find item', objectId);
				topic.publish('/dojo-mama/show404', e);
			}else{
				this.buildItemDetailList(item);
			}
	
		},

		buildItemDetailList: function(/*Object*/item) {
			// summary:
			//     Builds the item detail list
			// item:
			//     The item object
			var i, list, li,
				field, value,
				fieldIterator = item.getFieldIterator(),
				beforeText = this.getText('beforeText'),
				afterText = this.getText('afterText');

			this.fields = {};

			this._item = item;

			this._updateSubNav(item);

			if(beforeText){
				domConstruct.create('h3', {innerHTML: beforeText},this.content.domNode);
			}

			// build out the list
			list = new EdgeToEdgeList();
			list.startup();
			list.placeAt(this.content.domNode);

			// populate each list
			while((field = fieldIterator.next()) !== false){
				this.fields[field.getId()] = field;

				this._buildFieldListItem(field, item, list);
			}

			if(afterText){
				domConstruct.create('h3', {innerHTML: afterText},this.content.domNode);
			}

			this._buildItemControls(item);
		},

		_updateSubNav:function(/*Object*/item){
			// summary: 
			//     Updates the sub navigation
			// item: 
			//     the item object

			topic.publish('/dojo-mama/updateSubNav', {
				back: '/' + this.module.name,
				title: item.getValueById('label')
			});
		},

		_buildFieldListItem:function(/*Object*/field,/*Object*/item,/*Object*/list){
			// summary: 
			//     Builds out a single list item
			// field:
			//     the current field object to render
			// item:
			//     the item object
			// list:
			//     the List widget to add newly created listItems to.
			
			var li = new BaseListItem({
					text: field.getLabel()
				}),
				value = this.displayField(field);
			
			if (value) {
				li.set('rightText', value);
			}
			li.startup();
			if(field.isHidden()) {
				domClass.add(li.domNode, 'hidden');
			} else {
				list.addChild(li);
			}
			field.getListItem = function(){
				return li;
			};
		},

		_buildItemControls: function(/*Object*/item){
			// summary: 
			//     Builds out controls for interacting with the item being displayed
			// item:
			//     the item object

			var div;
			this.content.domNode.appendChild(div = domConstruct.create('div',
				{
					style:{
						"height": "30px",
						"padding-bottom": "20px"
					}
				}
			));

			// create edit button
			if (item.isEditable()) {
				domConstruct.create('a', {
					href: this.module.getRouteHref('/edit/') + encodeURIComponent(item.getId()),
					innerHTML: 'Edit',
					'class': 'button'
				}, div);
			}

			// create delete button
			if (item.isDeletable()) {
				domConstruct.create('a', {
					href: '#',
					innerHTML: 'Delete',
					'class': 'button',
					onclick: lang.hitch(this, function(e) {
						e.preventDefault();
						this.deleteItemConfirmation(item);
					})
				}, div);
			}

		},

		getPostSaveRoute: function(){
			return '/';
		},

		getPostDeleteRoute: function(){
			return '/';
		},

		deleteItemConfirmation: function(/*Object*/ item) {
			// summary:
			//     Confirms that the item should be deleted and requests its removal

			var dialog = new ConfirmationDialog({
				title: 'Confirm Delete',
				message: 'Are you sure you <br>want to delete this?',
				confirmLabel: 'Delete',
				onConfirm: lang.hitch(this,function(item) {
					console.log('deleting');
					this.deleteItem(item);
				},item)
			});
			dialog.show();
		},

		deleteItem: function(/*Object*/item) {
			// summary:
			//     Handler for actually deleting an item once the action has been confirmed by the user

			console.log('Deleting Item',item);
			
			this.module.saveData('delete', item).then(
				lang.hitch(this, function(data) {
					// on success, re-route
					this.module.set('stale', true);
					this.router.go(this.getPostDeleteRoute());
				})
				// the module handles the error
			);
		}

	});
});
