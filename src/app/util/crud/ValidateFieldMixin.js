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
		"dojo/_base/kernel",
		'dojo/dom-class',
		'app/util/lib-phone-number'
], function(declare, kernel, domClass, PhoneUtils) {


	var phoneUtils, PhoneValidationResult;

	phoneUtils = PhoneUtils.getInstance();
	PhoneValidationResult = PhoneUtils.ValidationResult;

	var tagRegex = /(<([^>]+)>)/ig;
	// module:
	//     app/util/crud/ValidateMixin

	return declare([], {
		MAX_STR_LEN: 200,
		validateFieldInput: function(/*Object*/ itemField, /*Object*/ renderedField, /*Boolean*/ showErrors, /*Object*/ resultObj){
			var message, li = false, type = itemField.getType(), id = itemField.getId();
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

			var fctnName = 'validate' + id + 'FieldInput';

			if(!this[fctnName] || typeof this[fctnName] !== "function"){
				fctnName = 'validate' + type + 'FieldInput';
			}

			if(!this[fctnName] || typeof this[fctnName] !== "function"){
				throw "unknown function for type "+type+".";
			}


			message = this[fctnName](itemField, renderedField);

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
			if(val.length > this.MAX_STR_LEN){
				return itemField.getLabel() + ' must be less than 200 characters.';
			}
			if(isNaN(parseFloat(val)) || !isFinite(val)){
				return itemField.getLabel() + ' must be a valid number.';
			}
		},

		validatePhoneNumberFieldInput: function(/*Object*/ itemField, /*Object*/ renderedField){

			var number, message, reason,
				valid = false, val = renderedField.getValue();

			if(val === ""){
				if(itemField.isRequired()){
					return itemField.getLabel() + ' is a required field.';
				}else{
					return;
				}
			}

			if(val.length < 3){
				return 'The phone number supplied for '+ itemField.getLabel() + ' is too short.';
			}
			
			try {
				
				number = phoneUtils.parseAndKeepRawInput(val, "US");
				valid = (phoneUtils.isValidNumber(number) && !(/[a-z]/i.test(val))); // Do not accept alphabetical chars
				
			} catch (e) {
				message = 'The phone number supplied for ' + itemField.getLabel() + ' has an issue: '+e;
				
				//make sure the error is punctuated...
				if(message.charAt(message.length-1) != '.'){
					message+='.';
				}
				return message;
			}
			if (!valid) {
				reason = phoneUtils.isPossibleNumberWithReason(number);
				message = '(a)The phone number supplied for ' + itemField.getLabel() + ' ';
				switch (reason) {
					case PhoneValidationResult.INVALID_COUNTRY_CODE:
						message+='has an invalid country code.';
					break;
					case PhoneValidationResult.TOO_SHORT:
						message+='is too short.';
					break;
					case PhoneValidationResult.TOO_LONG:
						message+='is too long.';
					break;
					default:
						message+='does not seem valid.  If this is an international number, you may need 011 at the front.';
					break;
				}

				return message;
			}
		},

		validateSelectFieldInput: function(/*Object*/ itemField, /*Object*/ renderedField){
			
			if(itemField.isRequired() && renderedField.getValue() === ""){
				return "Please make a valid selection for " + itemField.getLabel() + ".";
			}
		},

		validateTextFieldInput: function(/*Object*/ itemField, /*Object*/ renderedField){
			var val = renderedField.getValue();
			if(tagRegex.test(val)){
				return itemField.getLabel() + ' cannot accept xml tags.';
			}
			if(itemField.isRequired() && val === ""){
				return itemField.getLabel() + ' is a required field.';
			}
			if(val.length > this.MAX_STR_LEN){
				return itemField.getLabel() + ' must be less than 200 characters.';
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
