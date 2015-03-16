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

define([
		"dojo/_base/declare",
		"dojo/i18n!app/util/crud/resources/nls/nls.js"
], function(declare, baseText) {
	// module:
	//     app/util/crud/TextMixin

	return declare([], {

		// summary:
		//     Fetches text data from the profile nls file
		
		// text: private Object
		text: baseText,

		getText: function(stringId) {
			// summary:
			//     Retrieves a string from the NLS file based on a view's dataType
			//     and viewType (role).
			if (!this.text) {
				console.warn('No NLS text resource', this.text);
				return false;
			}
			
			if (this.dataType === undefined && this.text[stringId]) {
				return this.text[stringId];
			}
			if (this.dataType && this.viewType &&
					this.text[this.dataType] &&
					this.text[this.dataType][this.viewType] &&
					this.text[this.dataType][this.viewType][stringId]) {
				return this.text[this.dataType][this.viewType][stringId];
			}
			if (this.dataType && this.text[this.dataType] && this.text[this.dataType][stringId]) {
				return this.text[this.dataType][stringId];
			}
			if (this.text[stringId]) {
				return this.text[stringId];
			}
			
			console.log('dataType', this.dataType, 'viewType', this.viewType, this);
			console.warn('String ID not found:', stringId);
			return false;
		}
	});
});
