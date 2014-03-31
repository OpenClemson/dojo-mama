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
		'dojo/_base/kernel',
		'dojo/dom-construct',
		'dojo/dom-class',
		'dojo/topic',
		'dojo-mama/util/EdgeToEdgeList',
		'dojox/mobile/Switch',
		'dojo-mama/util/BaseListItem',
		'dojo-mama/util/toaster',
		'app/util/crud/DisplayView',
		'app/util/crud/DisplayFieldInputMixin',
		'app/util/crud/ValidateFieldMixin',
		'app/util/Select'
], function(declare, lang, kernel, domConstruct, domClass, topic, EdgeToEdgeList, Switch,
		BaseListItem, toaster, DisplayView, DisplayFieldInputMixin, ValidateFieldMixin, Select) {

	// module:
	//     app/util/crud/EditView

	return declare([DisplayView, DisplayFieldInputMixin, ValidateFieldMixin], {
		// summary:
		//     A edit view for CRUD data items

		// _item: [private] Object
		//     The CRUD data for the item being edited
		_item: null,
		// route: String
		//     The dojo-mama/views/ModuleScrollableView route
		route: '/edit/:id',
		// viewType: String
		//     The type of this view, used with nls resources (app/util/crud/TextMixin)
		viewType: 'Edit',

		postCreate: function() {
			// summary:
			//     Build out the static view list content

			var heading = this.getText('beforeList');

			if (heading) {
				domConstruct.create('h3', {
					innerHTML: heading
				}, this.containerNode);
			}
			this.inherited(arguments);
		},

		_updateSubNav:function(/*Object*/item){
			// summary: 
			//     Updates the sub navigation
			// item: 
			//     the item object

			//if we aren't displayable then we should have come from
			//the ListView, and the back button should take us back there.
			//Since DisplayView does this already lets just call its function to 
			//reduce code duplication.
			if(this.module.parser.isDisplayable() !== true){
				DisplayView.prototype._updateSubNav.apply(this,[item]);
				return;
			}

			this.backRoute = item.getId() ?
				'/display/' + encodeURIComponent(item.getId()) :
				'/';

			topic.publish('/dojo-mama/updateSubNav', {
				back: this.module.getAbsoluteRoute(this.backRoute),
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
			
			var li, value, attr,
				label = field.getLabel(),
				required = field.isRequired() && field.isEditable();

			li = new BaseListItem({
				text: required ? label + ' *' : label
			});
			if (required) {
				domClass.add(li.domNode, 'required');
			}

			if (field.isEditable()) {
				value = this.displayFieldInput(field);
				attr = 'rightTextNode';
			} else {
				value = this.displayField(field);
				attr = 'rightText';
			}
			if (value) {
				li.set(attr, value);
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
			domConstruct.create('a', {
				href: '#',
				innerHTML: 'Save',
				onclick: lang.hitch(this, this.save),
				'class': 'button'
			}, div);

			//if the item is deletable AND we dont have a displayView
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
			
			domConstruct.create('a', {
				href: '#',
				innerHTML: 'Cancel',
				'class': 'button',
				onclick: lang.hitch(this, function(e){
					this.router.go(this.getPostSaveRoute(item));
				})
			}, div);
		},

		save: function(e) {
			// summary:
			//     Onlick handler for the save button

			e.preventDefault();
			toaster.clearMessages();

			var validation = this.validate();
			if (!validation.valid) {
				toaster.displayMessage({
					type: 'error',
					text: validation.message || 'Invalid input',
					time: -1
				});
				return;
			}

			var field,
				item = this._item,
				fieldIterator = item.getFieldIterator(),
				diff = {},
				commit = false,
				i, id, oldValue, newValue;

			while((field = fieldIterator.next())!== false){
				if(field.isEditable()){
					id = field.getId();
					oldValue = field.getValue();
					newValue = this.fields[id].getValue();
					if(oldValue && !newValue){
						diff[id] = [];
						commit = true;
					}else if(newValue && oldValue !== newValue){
						diff[id] = newValue;
						commit = true;
					}
				}
			}
			
			// if there are no changes, refresh the data and display the item
			if (!commit) {
				this.module.set('stale', true);
				this.router.go(this.getPostSaveRoute(item));
				return;
			}

			console.log('Saving data');
			this.module.saveData(this.viewType, item, this.getSaveRequest(diff)).then(
				lang.hitch(this, function(data) {
					// on success, re-route
					this.module.set('stale', true);
					this.router.go(this.getPostSaveRoute(item));
				})
			);
		},

		getSaveRequest: function(diff) {
			// summary:
			//     Returns the payload to save
			return diff;
		},

		getPostSaveRoute: function(item) {
			// summary:
			//     Returns the route to go to after saving CRUD data
			// item:
			//     The item being saved

			if(item.isDisplayable()){
				return '/display/' + encodeURIComponent(item.getId());
			}
			return '/';
		},

		validate: function(/*Boolean*/showErrors) {
			// summary:
			//     Validate form data
			// returns: Object
			//     Returns a validation object
			//
			// | // for valid inputs, returns:
			// | {
			// |     valid: true
			// | }
			// |
			// | // or, for invalid values:
			// | {
			// |     valid: false,
			// |     message: "Please enter a valid value"
			// | }
			var itemField, renderedField, fieldId,
				itemFieldIterator = this._item.getFieldIterator(),
				retObj = {valid: true};

			if(showErrors === undefined){
				showErrors = true;
			}

			while((itemField = itemFieldIterator.next()) !== false){
				fieldId = itemField.getId();
				renderedField = this.fields[fieldId];

				if(!renderedField){
					continue;
				}
				this.validateFieldInput(itemField, renderedField, showErrors, retObj);
			}

			return retObj;
		}

	});
});
