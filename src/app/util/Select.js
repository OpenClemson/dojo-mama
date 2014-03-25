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

define(['dojo/_base/declare', 'dojo/dom-construct', 'dijit/_WidgetBase'
], function(
	declare, domConstruct, WidgetBase
) {

	// module:
	//     app/util/Select

	return declare([WidgetBase], {
		// summary:
		//     A mobile-friendly select box

		baseClass: 'select',

		// options: Array
		//     Default options
		options: null,

		// select: Object
		//     Points to the select dom node
		select: null,

		// value: String
		//     Default selected value
		value: null,

		buildRendering: function(){
			this.inherited(arguments);
			//WidgetBase.prototype.buildRendering.call(this);
			this.select = domConstruct.create('select', {}, this.domNode);
			if (this.options) {
				this.set('options', this.options, this.value);
			}
		},

		_setOptionsAttr: function(/*Object*/ options, /*String?*/ selected){
			// summary:
			//     Sets select options
			// options: Array
			//     Array of option objects in the form {label: 'my label', value: '10'}
			// selected: String
			//     The selected value
			
			var i, option, node;
			domConstruct.empty(this.select);
			for (i=0; i < options.length; ++i) {
				option = options[i];
				if (option) {
					node = domConstruct.create('option', {
						innerHTML: option.label,
						value: option.value
					}, this.select);
					if (option.value === selected) {
						node.selected = true;
					}
				}
			}

		},

		_getValueAttr: function(){
			// summary:
			//     Returns the selected value

			return this.select.value;
		},

		_setValueAttr: function(/*Object*/ selected){
			// summary:
			//     Selects a value

			this.select.value = selected;
		}

	});
});
