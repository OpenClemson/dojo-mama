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

define(['dojo/_base/declare', 'dojo/_base/lang', 'dojo/dom-construct', 'dijit/_WidgetBase', 'app/layout/layout'
], function(
	declare, lang, domConstruct, WidgetBase, layout
) {

	// module:
	//     app/util/Select

	return declare([WidgetBase], {
		// summary:
		//     A mobile-friendly select box

		baseClass: 'select',

		// label: String
		//     The input's label
		label: '',

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
			if (this.label) {
				this.labelNode = domConstruct.create('label', {
					innerHTML: this.label,
					'for': this.id + '_select'
				}, this.domNode);
			}
			this.select = domConstruct.create('select', {
				onchange: lang.hitch(this,this._onChange),
				id: this.id + '_select'
			}, this.domNode);
			if (this.options) {
				this.set('options', this.options, this.value);
			}
		},

		_setOptionsAttr: function(/*Array*/ options, /*String?*/ selected){
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
				}
			}
			this.set('value', selected || options[0].value);
		},

		_onChange: function() {
			this.onChange.apply(this, arguments);
		},
		onChange: function() {},

		_getValueAttr: function(){
			// summary:
			//     Returns the selected value
			return this.select.value;
		},

		_getLabelAttr: function(){
			// summary:
			//     Returns the selected option's label
			return this.select.options[this.select.selectedIndex].innerHTML;
		},

		_setValueAttr: function(/*Object*/ selected){
			// summary:
			//     Selects a value
			if (selected) {
				this.select.value = selected;
				layout.updateSelects();
			}
		}

	});
});
