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
		"dojo/_base/kernel"
], function(declare, kernel) {

	// module:
	//     app/util/crud/DisplayMixin

	return declare([], {
		displayField: function(/*Object*/ field) {
			// summary:
			//     Returns an item's display value
			// field:
			//     The item's field properties

			if(!field){
				return field.getValue();
			}
			var type = field.getType();
			type = type.charAt(0).toUpperCase() + type.slice(1, type.length);
			return this['display' + type + 'Field'](field);
		},

		displayNumberField: function(/*Object*/ field) {
			// summary:
			//     Returns a number item's display value
			// field:
			//     The item's field properties
			return field.getValue();
		},

		displaySelectField: function(/*Object*/ field) {
			// summary:
			//     Returns a select item's display value
			// field:
			//     The item's field properties
			
			var extendedAttrs = field.getExtendedAttributes(),
				options = extendedAttrs.options,
				value = field.getValue(),
				option, i;
			for (i=0; i < options.length; ++i) {
				option = options[i];
				if (option.value === value) {
					return option.label;
				}
			}
		},

		displayTextField: function(/*Object*/ field) {
			// summary:
			//     Returns a text item's display value
			// field:
			//     The item's field properties
			return field.getValue();
		},

		displayCheckboxField: function(/*Object*/ field){
			// summary:
			//     Returns true / false.
			// field:
			//     The item's field properties

			return (field.getValue()) ? 'True' : 'False';
		},

		displaySwitchField: function(/*Object*/ field){
			// summary:
			//     Returns true / false.
			// field:
			//     The item's field properties

			return (field.getValue()) ? 'On' : 'Off';
		}
	});
});
