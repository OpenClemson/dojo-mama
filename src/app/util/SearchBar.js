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
		'dojo/dom-class',
		'dojo/keys',
		'dojo/has',
		'dojo/on',
		'dojox/mobile/Button',
		'dojox/mobile/TextBox',
		'dijit/_WidgetBase'
], function(declare, lang, domConstruct, domClass, keys, has, on, Button, TextBox, WidgetBase) {
	return declare([WidgetBase], {

		baseClass: 'searchBar',

		placeHolder: '',

		textBox: null,

		textBoxWrapper: null,

		searchButton: null,

		clearButton: null,

		onChange: null,

		onKeyDownSignal: null,

		onClickSignal: null,

		onSearch: null,

		buildRendering: function() {
			this.inherited(arguments);

			this.textBoxWrapper = domConstruct.create('div', {
				'class': 'textBoxWrapper'
			}, this.domNode);

			this.textBox = new TextBox({
				placeHolder: this.placeHolder,
				trim: true
			});
			this.textBox.placeAt(this.textBoxWrapper);
			this.textBox.startup();

			this.clearButton = new Button({
				'class': 'clearButton icon-cross3',
				onClick: lang.hitch(this, function() {
					this.clear();
				})
			});
			this.clearButton.placeAt(this.textBoxWrapper);
			this.clearButton.startup();

			this.searchButton = new Button({
				'class': 'button searchButton',
				duration: 0,
				label: 'Search',
				title: 'Search'
			});
			this.searchButton.placeAt(this.domNode);
		},

		_getValueAttr: function() {
			return this.textBox.get('value');
		},

		_setValueAttr: function(/*String*/ value) {
			this.textBox.set('value', value);
		},

		_setOnChangeAttr: function(onChange) {
			this._set('onChange', onChange);

			this.textBox.set('intermediateChanges', (onChange !== null));

			this.textBox.set('onChange', lang.hitch(this, function() {

				// Retreive the text
				var text = this.textBox.get('value');

				// Show/hide the clear button
				if (!has("ie")) {
					if (text.length > 0) {
						domClass.add(this.clearButton.domNode, 'visible');
					} else {
						domClass.remove(this.clearButton.domNode, 'visible');
					}
				}

				onChange(text);
			}));
		},

		_setOnSearchAttr: function(onSearch) {
			this._set('onSearch', onSearch);

			if (this.onClickSignal !== null) {
				this.onClickSignal.remove();
			}
			on(this.searchButton, 'click', lang.hitch(this, function() {
				this.onSearch(this.textBox.get('value'));
			}));

			// Allow searching by pressing enter button in text box
			if (this.onKeyDownSignal !== null) {
				this.onKeyDownSignal.remove();
			}
			this.onKeyDownSignal = this.textBox.on('keydown', lang.hitch(this, function(e) {
				if (e.keyCode == keys.ENTER) {
					this.onSearch(this.textBox.get('value'));
				}
			}));
		},

		_setPlaceHolderAttr: function(placeHolder) {
			this._set('placeHolder', placeHolder);
			this.textBox.set('placeHolder', placeHolder);
		},

		clear: function() {
			this.textBox.set('value', '');
		},

		destroy: function() {
			if (this.onKeyDownSignal !== null) {
				this.onKeyDownSignal.remove();
			}
			this.inherited(arguments);
		},

		focus: function() {
			this.textBox.domNode.focus();
		}

	});
});
