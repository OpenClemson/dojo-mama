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
		'dojo/dom-attr',
		'dojo/dom-class',
		'dojo/dom-construct',
		'dojo/on',
		'dijit/_WidgetBase'
], function(declare, lang, domAttr, domClass, domConstruct, on, _WidgetBase) {
	return declare([_WidgetBase], {

		icon: null,

		onIconLoad: null,

		text: null,

		rightText: null,

		style: null,

		iconContainerNode: null,

		iconNode: null,

		textNode: null,

		rightTextNode: null,

		onClick: null,

		onClickSignal: null,

		buildRendering: function() {
			this.domNode = domConstruct.create('li', {
				'class': 'listItem'
			});

			this.textNode = domConstruct.create('div', {
				'class': 'text'
			}, this.domNode);

			// add baseClass to the domNode after we've created it
			this.inherited(arguments);
		},

		destroy: function() {
			if (this.onClickSignal) {
				this.onClickSignal.remove();
			}
			this.inherited(arguments);
		},

		_setIconAttr: function(icon) {
			this._set('icon', icon);

			if (icon === null) {
				if (this.iconNode) {
					domConstruct.destroy(this.iconNode);
				}
				return;
			}

			if (!this.iconNode) {
				this.iconContainerNode = domConstruct.create('div', {
					'class': 'iconContainer'
				}, this.textNode, 'before');
				this.iconNode = domConstruct.create('img', {
					'class': 'icon'
				}, this.iconContainerNode);

				domClass.add(this.domNode, "hasIcon");
			}

			if (this.onIconLoad !== null) {
				var img = new Image();
				img.onload = lang.hitch(this, lang.partial(this.onIconLoad, img));
				img.src = icon;
			}

			domAttr.set(this.iconNode, 'src', icon);
		},

		_setTextAttr: function(text) {
			this._set('text', text);

			this.textNode.innerHTML = text;
		},

		_setStyleAttr: function(style) {
			this._set('style', style);

			domAttr.set(this.rightTextNode, 'style', style);
		},

		_setRightTextAttr: function(rightText) {
			this._set('rightText', rightText);

			if (!this.rightTextNode) {
				this.rightTextNode = domConstruct.create('div', {
					'class': 'rightText'
				}, this.textNode, 'after');
				domClass.add(this.domNode, "hasRightText");
			}
			this.rightTextNode.innerHTML = rightText;
		},

		_setRightTextNodeAttr: function(node) {
			if (!this.rightTextNode) {
				this.rightTextNode = node;
				domClass.add(node, 'rightText');
				domConstruct.place(node, this.textNode, 'after');
			} else {
				domConstruct.destroy(this.rightTextNode);
				this.rightTextNode = node;
			}
			domClass.add(this.domNode, "hasRightText");
		},

		_setOnClickAttr: function(onClick) {
			this._set('onClick', onClick);

			if (this.onClickSignal) {
				this.onClickSignal.remove();
			}
			this.onClickSignal = on(this.domNode, 'click', onClick);
		}
	});
});
