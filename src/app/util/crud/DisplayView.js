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
		'dojo/dom-construct',
		'dojo/dom-class',
		'dojo/request/xhr',
		'app/layout/layout',
		'app/util/EdgeToEdgeList',
		'dojox/mobile/Pane',
		'app/util/BaseListItem',
		'app/util/toaster',
		'app/util/crud/View',
		'app/util/crud/DisplayFieldMixin',
		'app/util/crud/TextMixin',
		'app/util/ConfirmationDialog'
], function(declare, lang, domConstruct, domClass, xhr, layout, EdgeToEdgeList, Pane,
		BaseListItem, toaster, View, DisplayFieldMixin, TextMixin, ConfirmationDialog) {
	
	// module:
	//     app/util/crud/DisplayView

	return declare([View, DisplayFieldMixin,TextMixin], {
		// summary:
		//     A display view for CRUD data items

		// route: String
		//     The dojo-mama route
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
			domClass.add(this.domNode, 'displayView');
			
			this.buildView(e);
		},

		deactivate: function() {
			this.inherited(arguments);
			domClass.remove(this.domNode, 'displayView');
		},

		buildView: function(e) {
			// summary:
			//     Build the view after routing
			// e:
			//     The dojo/router event

			var objectId = decodeURIComponent(e.params.id);
			
			// Destroy existing list view content
			this._clearView();

			layout.startProgress();
			// Build out a list of items
			this.module.getData().then(lang.hitch(this, this._handleData, objectId,e),
				function(){
					layout.stopProgress();
				}
			);
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
			layout.stopProgress();
			var item = parser.getItemById(objectId);
			if(!item){
				console.warn('cannot find item', objectId);
				layout.show404();
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
				domConstruct.create('div',{'class':'afterText',innerHTML: afterText},this.content.domNode);
			}

			this._buildItemControls(item);

		},

		_updateSubNav:function(/*Object*/item){
			// summary: 
			//     Updates the sub navigation
			// item: 
			//     the item object

			layout.updateSubNav({
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

			var div = domConstruct.create('div', {
					'class': "buttonBar"
			}, this.content.domNode);

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
					this.module.setStale(true);

					var howFarBack = (this.viewType == 'Display') ? -1 : -2;
					window.history.go(howFarBack);
				})
				// the module handles the error
			);
		}

	});
});
