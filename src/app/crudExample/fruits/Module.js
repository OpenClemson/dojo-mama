/*
dojo-mama: a JavaScript framework
Copyright (C) 2014 Omnibond Systems LLC

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

define(["dojo/_base/declare",
		"app/util/crud/Module",
		'app/util/crud/DisplayView',
		"app/util/crud/CreateView",
		'app/util/crud/ListView',
		"app/util/crud/EditView"
], function(declare, Module, DisplayView, CreateView, ListView, EditView) {
	return declare([Module], {
		'class': 'fruitsModule',
		// serviceUrl: String
		//     The API endpoint for CRUD data requests
		serviceUrl: 'fruits',
		// dataType: String
		//     The type of CRUD data, used with app/util/crud/TextMixin
		dataType: 'fruits',
		listItemRightText: 'label'
	});
});
