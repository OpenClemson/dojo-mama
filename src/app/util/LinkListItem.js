/*
dojo-mama: a JavaScript framework
Copyright (C) 2015 Clemson University

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
Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA
*/

define(['dojo/_base/declare',
		'dojo/dom-attr',
		'dojo/dom-class',
		'dojo/dom-construct',
		'dojo/has',
		'./BaseListItem'
], function(declare, domAttr, domClass, domConstruct, has, BaseListItem) {
	return declare([BaseListItem], {

		href: null,
		hrefTarget: null,
		linkNode: null,
		rightIconNode: null,
		style: null,
		iconClass: '',

		buildRendering: function() {
			this.inherited(arguments);
			domClass.add(this.domNode, 'linkListItem');
			this.linkNode = domConstruct.create('a', null, this.domNode);
			domConstruct.place(this.textNode, this.linkNode);
			this.rightIconNode = domConstruct.create('div', {
				'class': 'icon'
			}, this.textNode, 'after');
			domClass.add(this.domNode, "hasIcon");
		},

		_setHrefAttr: function(href) {
			this._set('href', href);
			domAttr.set(this.linkNode, 'href', href);
			if (href === null) {
				domAttr.remove(this.linkNode, 'href');
			} else {
				domAttr.set(this.linkNode, 'href', href);
				if (this.iconClass !== null) {
					if (this.iconClass) {
						this.set('rightIcon', this.iconClass);
					} else if (href.slice(0, 4) === 'tel:') {
						this.set('rightIcon', 'icon-phone');
					} else if (href.slice(0, 7) === 'mailto:') {
						this.set('rightIcon', 'icon-mail');
					} else if (href[0] !== '/' && href[0] !== '#') {
						// external links
						this.set('rightIcon', 'icon-link');
					} else {
						this.set('rightIcon', 'icon-arrow-right5');
					}
				}
			}
		},

		_getLinkNodeAttr: function() {
			return this.linkNode;
		},

		_setStyleAttr: function(style) {
			this._set('style', style);
			if (style === null) {
				domAttr.remove(this.linkNode, 'style');
			} else {
				domAttr.set(this.linkNode, 'style', style);
			}
		},

		_setHrefTargetAttr: function(hrefTarget) {
			this._set('hrefTarget', hrefTarget);
			if (!hrefTarget) {
				domAttr.remove(this.linkNode, 'target');
			} else {
				domAttr.set(this.linkNode, 'target', hrefTarget);
			}
		},

		_setRightIconAttr: function(cls) {
			this.inherited(arguments);
			domClass.replace(this.rightIconNode, cls, 'icon-link icon-phone icon-mail icon-chevron-right-large');
		},

		_setRightTextAttr: function() {
			this.inherited(arguments);

			domConstruct.place(this.rightTextNode, this.textNode, 'after');
		}
	});
});
