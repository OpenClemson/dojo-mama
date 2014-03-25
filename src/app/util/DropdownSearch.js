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
		'dojo/_base/lang',
		'dojo/dom-construct',
		'dojo/keys',
		'dojo/on',
		'dojox/mobile/Button',
		'dojox/mobile/ComboBox',
		'dijit/_WidgetBase',
		'dojo/store/Memory'
], function(declare, lang, domConstruct, keys, on, Button, ComboBox, WidgetBase, Memory) {
	return declare([WidgetBase], {

		baseClass: 'dropdownSearch',

		placeHolder: '',

		comboBox: null,

		comboBoxWrapper: null,

		searchButton: null,

		onKeyDownSignal: null,

		acKeyCount: 3, // number of keystrokes to initial search

		onClickSignal: null,

		onSearch: null,

		buildRendering: function() {
			this.inherited(arguments);

			this.comboBoxWrapper = domConstruct.create('div', {
				'class': 'comboBoxWrapper'
			}, this.domNode);

			// build a ComboBox object
			this.comboBox = new ComboBox({
				placeHolder: this.placeHolder,
				trim: true,
				list: new Memory({
					idProperty: 'testData',
					data:[
						{ name: 'apple' },
						{ name: 'banana' },
						{ name: 'orange' }
					]
				}),
				value: 'data'
				//intermediateChanges: true // enable onChange trigger
			});
			this.comboBox.placeAt(this.comboBoxWrapper);
			this.comboBox.startup();

			// build a Button object
			this.searchButton = new Button({
				'class': 'button searchButton',
				duration: 0,
				label: 'Search',
				title: 'Search'
			});
			this.searchButton.placeAt(this.domNode);
		},

		_getValueAttr: function() {
			return this.comboBox.get('value');
		},

		_setValueAttr: function(/*String*/ value) {
			this.comboBox.set('value', value);
		},

		_setOnSearchAttr: function(onSearch) {
			this._set('onSearch', onSearch);

			this.comboBox.set('onChange', lang.hitch(this, function() {
				if (this.comboBox.get('value').length >= this.acKeyCount) {
					this.onSearch(this.comboBox.get('value'));
				} else {
					this.onSearch('');
				}
			}));

			if (this.onClickSignal !== null) {
				this.onClickSignal.remove();
			}
			on(this.searchButton, 'click', lang.hitch(this, function() {
				this.onSearch(this.comboBox.get('value'));
				this.comboBox.domNode.blur();
			}));

			// Allow searching by pressing enter button in text box
			if (this.onKeyDownSignal !== null) {
				this.onKeyDownSignal.remove();
			}
			this.onKeyDownSignal = this.comboBox.on('keydown', lang.hitch(this, function(e) {
				if (e.keyCode == keys.ENTER) {
					this.onSearch(this.comboBox.get('value'));
					this.comboBox.domNode.blur();
				}
			}));
		},

		_setPlaceHolderAttr: function(placeHolder) {
			this._set('placeHolder', placeHolder);
			this.comboBox.set('placeHolder', placeHolder);
		},

		clear: function() {
			this.comboBox.set('value', '');
		},

		destroy: function() {
			if (this.onKeyDownSignal !== null) {
				this.onKeyDownSignal.remove();
			}
			this.inherited(arguments);
		},

		focus: function() {
			this.comboBox.domNode.focus();
		}

	});
});
