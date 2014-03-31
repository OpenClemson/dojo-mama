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
		'dojo/dom-class'
], function(declare, kernel, domClass) {

	// module:
	//     app/util/crud/ValidateMixin

	return declare([], {
		validateFieldInput: function(/*Object*/ itemField, /*Object*/ renderedField, /*Boolean*/ showErrors, /*Object*/ resultObj){
			var message, li = false, type = itemField.getType();
			type = type.charAt(0).toUpperCase() + type.slice(1, type.length);

			//if its not editable it should be valid
			//because if its not there's nothing the user can do about it
			if(!itemField.isEditable()){
				return;
			}

			//get the field's list item
			if (renderedField.getListItem){
				li = renderedField.getListItem();
			}

			message = this['validate' + type + 'FieldInput'](itemField, renderedField);

			if(message){
				//error
				resultObj.valid = false;
				if(!resultObj.message){
					resultObj.message = message;
				}

				//set the error on the li
				if(showErrors && li){
					domClass.add(li.domNode, 'inputError');
				}else if(!showErrors && li){
					//if we aren't showing errors, 
					//lets make sure to turn off any lingering error states
					domClass.remove(li.domNode, 'inputError');
				}
			}else{
				//no error
				if(li){
					domClass.remove(li.domNode, 'inputError');
				}
			}

			
		},

		validateNumberFieldInput: function(/*Object*/ itemField, /*Object*/ renderedField){

			if(itemField.isRequired() && renderedField.getValue() === ""){
				return itemField.getLabel() + ' is a required field.';
			}
			var val = renderedField.getValue();
			if(isNaN(parseFloat(val)) || !isFinite(val)){
				return itemField.getLabel() + ' must be a valid number.';
			}
		},

		validateSelectFieldInput: function(/*Object*/ itemField, /*Object*/ renderedField){
			
			if(itemField.isRequired() && renderedField.getValue() === ""){
				return "Please make a valid selection for " + itemField.getLabel() + ".";
			}
		},

		validateTextFieldInput: function(/*Object*/ itemField, /*Object*/ renderedField){
			if(itemField.isRequired() && renderedField.getValue() === ""){
				return itemField.getLabel() + ' is a required field.';
			}
		},

		validateSwitchFieldInput: function(/*Object*/ itemField, /*Object*/ renderedField){
			//switches can't be invalid, they're either some string like 'on' or 'off'
			return;
		},

		validateCheckboxFieldInput: function(/*Object*/ itemField, /*Object*/ renderedField){
			//checkboxes can't be invalid, they're either true or false...
			return;
		}
	});
});
