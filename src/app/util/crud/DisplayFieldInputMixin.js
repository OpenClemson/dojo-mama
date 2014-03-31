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


define([
		"dojo/_base/declare",
		"dojo/_base/kernel",
		'dojo/dom-construct',
		'dojo/keys',
		'dojox/mobile/Switch',
		'app/util/Select'
], function(declare, kernel, domConstruct, keys, Switch, Select) {

	// module:
	//     app/util/crud/DisplayMixin

	return declare([], {

		displayFieldInput: function(/*Object*/ field) {
			// summary:
			//     Returns an item's display value
			// field:
			//     The item's field properties
			// value:
			//     The item's value for a particular key

			var type = field.getType();
			type = type.charAt(0).toUpperCase() + type.slice(1, type.length);
			return this['display' + type + 'FieldInput'](field);
		},

		displayNumberFieldInput: function(/*Object*/ field) {
			// summary:
			//     Returns a number item's display value
			// field:
			//     The item's field properties
			// value:
			//     The item's value for a particular key
			return this.displayTextFieldInput(field);
		},

		displaySelectFieldInput: function(/*Object*/ field) {
			// summary:
			//     Returns a select item's display value
			// field:
			//     The item's field properties
			// value:
			//     The item's value for a particular key
			var extendedAttrs = field.getExtendedAttributes(),
				options = extendedAttrs.options,
				value = field.getValue(), select;

			select = new Select({options: options, value: value});
			field.getValue = function() {
				return select.get('value');
			};

			return select.domNode;
		},

		displayTextFieldInput: function(/*Object*/ field) {
			// summary:
			//     Returns a text item's display value
			// field:
			//     The item's field properties
			// value:
			//     The item's value for a particular key
			var node = domConstruct.create('input', {
				type: 'text',
				value: field.getValue() || ''
			});
			field.getValue = function() { return node.value; };
			field.setValue = function(newValue) { node.value = newValue; };
			return node;
		},
		
		displayCheckboxFieldInput: function(/*Object*/ field) {
			var node = domConstruct.create('input', {
				checked: field.getValue() || false,
				type: 'checkbox'
			});
			field.getValue = function() { return node.checked; };
			field.setValue = function(newValue) { node.checked = (newValue+"" == "true"); };
			return node;
		},

		displaySwitchFieldInput: function(/*Object*/ field){
			var opts = {value: 'off'};
			if(field.getValue()){
				opts.value = 'on';
			}
			var widget = new Switch(opts);
			field.getValue = function(){ return widget.get('value') === 'on';};
			return widget.domNode;
		}
	});
});
