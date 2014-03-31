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
		'dojo/_base/lang'
], function(declare, lang) {
	
	// module:
	//     app/util/crud/Parser

	return declare([], {
		_data: null,

		constructor: function(/*Object*/data){
			this._data = data;
		},

		getMetaData: function(){
			return this._data.properties.meta || {};
		},

		_newItem: function(/*Object*/data){
			var item = {
				_item:data,
				getId: lang.hitch(this, this.getItemId, data),
				getType: lang.hitch(this, this.getItemType, data),
				isDeletable: lang.hitch(this, this.isItemDeletable, data),
				isEditable: lang.hitch(this, this.isItemEditable, data),
				isDisplayable: lang.hitch(this, this.isDisplayable),
				getFieldIterator: lang.hitch(this, this.getItemFieldIterator, data),
				getFieldById: lang.hitch(this,this.getItemFieldById, data),
				getValueById: lang.hitch(this,this.getItemValueById, data),
				getMetaData: lang.hitch(this,this.getItemMetaData, data)
			};

			return item;
		},

		isDisplayable: function(){
			return this._data.properties.display;
		},

		//ItemIterator functions
		getItemIterator: function(){
			var iter = {
				_counter: 0,
				_items: this._data.items,

				numItems: this.numItems
			};

			iter.next = lang.hitch(this,this.nextItem, iter);
			iter.reset = lang.hitch(this,this.resetIterator, iter);

			return iter;
		},

		getItemByIndex: function(/*Number*/index){
			return this._newItem(this._data.items[index]);
		},

		getItemById: function(/*String*/id){

			var i;
			for(i = 0;i<this._data.items.length;i++){
				if(this._data.items[i].data.objectId == id){
					return this._newItem(this._data.items[i]);
				}
			}
			return false;
			
		},

		numItems: function(){
			return this._data.items.length;
		},

		nextItem: function(/*Object*/iterator){
			var i = iterator._counter;
			iterator._counter++;
			if(i === iterator._items.length){
				return false;
			}
			return this._newItem(iterator._items[i]);
		},

		resetIterator: function(/*Object*/iterator){
			iterator._counter = 0;
		},

		//Item functions
		getItemFieldIterator: function(/*Object*/item){
			var iter = {
				_counter: 0,
				_item: item
			};

			iter.next = lang.hitch(this,this.nextField, iter, item);
			iter.reset = lang.hitch(this,this.resetIterator, iter);

			return iter;
		},

		getItemValueById: function(/*Object*/item, /*String*/id){
			return item.data[id];
		},

		getItemId: function(/*Object*/item){
			return item.data.objectId;
		},

		getItemType: function(/*Object*/item){
			return item.properties.meta.type;
		},

		getItemMetaData: function(/*Object*/item){
			return item.properties.meta;
		},

		isItemDeletable: function(/*Object*/item){
			return item.properties.deletable;
		},

		isItemEditable: function(/*Object*/item){
			if(item._editable !== undefined){
				return item._editable;
			}

			var i, base, field;
			base = item.properties.defaults.editable;
			if(base === undefined){
				base = false;
			}
			for(i = 0;i<item.properties.fields.length;i++){
				field = undefined;
				field = item.properties.fields[i].editable;
				if(field !== undefined && field === true){
					item._editable = true;
					return true;
				}
				if(field === undefined && base === true){
					item._editable = true;
					return true;
				}
			}
			item._editable = false;
			return false;
		},

		getItemFieldById: function(/*Object*/ item, /*String*/fieldId){
			var i;
			for(i=0;i<item.properties.fields.length;i++){
				if(item.properties.fields[i].id === fieldId){
					var data = lang.mixin({}, item.properties.defaults, item.properties.fields[i], {value: item.data[fieldId]});
					return this._newField(data);
				}
			}
			return false;
		},

		//FieldIterator functions
		nextField: function(/*Object*/iterator, /*Object*/item){
			var i = iterator._counter;
			iterator._counter++;
			if(i === item.properties.fields.length){
				return false;
			}

			var data = lang.mixin(
				{},
				item.properties.defaults,
				item.properties.fields[i]
			);

			data.value = item.data[data.id];

			return this._newField(data);
		},

		_newField: function(/*Object*/data){
			var field = {
				_field: data,

				getId: lang.hitch(this,this.getFieldId, data),
				getType: lang.hitch(this,this.getFieldType, data),
				getValue: lang.hitch(this,this.getFieldValue, data),
				getLabel: lang.hitch(this,this.getFieldLabel, data),
				getExtendedAttributes: lang.hitch(this,this.getFieldExtendedAttributes, data),

				isEditable: lang.hitch(this,this.isFieldEditable, data),
				isRequired: lang.hitch(this,this.isFieldRequired, data),
				isHidden: lang.hitch(this, this.isFieldHidden, data)
			};

			return field;
		},


		//Field functions
		getFieldId: function(/*Object*/field){
			return field.id;
		},

		getFieldValue: function(/*Object*/field){
			return field.value;
		},

		getFieldType: function(/*Object*/field){
			return field.type;
		},

		getFieldLabel: function(/*Object*/field){
			return field.label || field.id;
		},

		getFieldExtendedAttributes: function(/*Object*/field){
			var ret = lang.mixin({},field);

			//delete all the standard attrs
			//so only extended attrs are returned
			delete ret.type;
			delete ret.label;
			delete ret.value;
			delete ret.id;
			delete ret.required;
			delete ret.editable;

			return ret;
		},

		isFieldEditable: function(/*Object*/field){
			return field.editable || false;
		},

		isFieldRequired: function(/*Object*/field){
			return field.required || false;
		},

		isFieldHidden: function(/*Object*/field) {
			return field.hidden || false;
		},
		//TypeIterator functions
		getTypeIterator: function(){
			var iter = {
				_counter: 0
			};

			iter.next = lang.hitch(this,this.nextType, iter);
			iter.reset = lang.hitch(this,this.resetIterator, iter);

			return iter;
		},

		nextType: function(/*Object*/iterator){
			var i = iterator._counter,data;
			iterator._counter++;
			if(i === this._data.properties.displayOrder.length){
				return false;
			}
			var id = this._data.properties.displayOrder[i];
			var mixinArgs = {
				id: id,
				categoryLabel: id,
				creatable: false
			};

			if(this._data.properties.create){
				mixinArgs.createProperties = this._data.properties.create_properties[id];
			}
			data = lang.mixin(
				{},
				mixinArgs,
				this._data.properties.types.defaults,
				this._data.properties.types[id]
			);

			return this._newType(data);
		},

		getTypeById: function(/*String*/id){
			if(!this._data.properties.types[id]){
				return false;
			}
			var mixinArgs = {
				id: id,
				categoryLabel: id,
				creatable: false
			};

			if(this._data.properties.create){
				mixinArgs.createProperties = this._data.properties.create_properties[id];
			}

			var data = lang.mixin(
				{},
				mixinArgs,
				this._data.properties.types.defaults,
				this._data.properties.types[id]
			);

			return this._newType(data);
		},

		//Type functions
		_newType: function(/*Object*/data){
			var ret = {
				_data: data,

				getId: lang.hitch(this,this.getTypeId, data),
				getCreateLabel: lang.hitch(this,this.getTypeCreateLabel, data),
				getDeleteLabel: lang.hitch(this,this.getTypeDeleteLabel, data),
				getEmptyLabel: lang.hitch(this,this.getTypeEmptyLabel, data),
				getCategoryLabel: lang.hitch(this,this.getTypeCategoryLabel, data),
				getCreateProperties: lang.hitch(this,this.getTypeCreateProperties, data),

				isCreatable: lang.hitch(this,this.isTypeCreatable, data)
			};

			return ret;
		},

		getTypeId: function(/*Object*/type){
			return type.id;
		},

		isTypeCreatable: function(/*Object*/type){
			return type.creatable;
		},

		getTypeCreateLabel: function(/*Object*/type){
			return type.createLabel;
		},

		getTypeDeleteLabel: function(/*Object*/type){
			return type.deleteLable;
		},

		getTypeEmptyLabel: function(/*Object*/type){
			return type.emptyLabel;
		},

		getTypeCategoryLabel: function(/*Object*/type){
			return type.categoryLabel;
		},

		getTypeCreateProperties: function(/*Object*/type){
			return type.createProperties;
		}
	});
});
