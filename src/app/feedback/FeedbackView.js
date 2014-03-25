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
		'dojo/dom-attr',
		'dojo/dom-class',
		'dojo/dom-construct',
		'dojo/request',
		'dojox/mobile/Button',
		'dojox/mobile/CheckBox',
		'app/util/ProgressIndicator',
		'dojox/mobile/TextArea',
		'dojox/mobile/TextBox',
		'dojo-mama/views/ModuleScrollableView',
		'dojo-mama/util/toaster',
		'app/util/CachedXHR'
], function(declare, lang, domAttr, domClass, domConstruct, request, Button, CheckBox, ProgressIndicator, TextArea, TextBox, ModuleScrollableView, toaster, CachedXHR) {
	return declare([ModuleScrollableView], {

		'class': 'feedbackView',
		title: 'Provide Feedback',

		infoNode: null,
		form: null,
		nameField: null,
		emailField: null,
		feedbackField: null,
		browserInfoCheckBox: null,
		submitButton: null,
		feedbackSubmissionURL: 'srv/feedback/feedback.php',
		previousRoute: null,
		successMessageNode: null,

		buildRendering: function() {
			this.inherited(arguments);

			this.infoNode = domConstruct.create('p', {
				'class': 'feedbackInfo',
				innerHTML: "Let us know how we're doing!"
			}, this.containerNode);

			this.form = domConstruct.create('form', {
				id: 'feedbackForm'
			}, this.containerNode);

			domConstruct.create('p', {
				'class': 'requiredFieldsNotice',
				innerHTML: 'All fields required'
			}, this.form);

			domConstruct.create('label', {
				'for': 'feedbackNameField',
				innerHTML: 'Your Name'
			}, this.form);

			this.nameField = new TextBox({
				id: 'feedbackNameField',
				name: 'feedbackName',
				placeHolder: 'Your Name',
				trim: true
			});
			this.nameField.placeAt(this.form);
			this.nameField.startup();

			domConstruct.create('label', {
				'for': 'feedbackEmailField',
				innerHTML: 'Your Email Address'
			}, this.form);

			this.emailField = new TextBox({
				id: 'feedbackEmailField',
				name: 'feedbackEmail',
				placeHolder: 'Your Email Address',
				trim: true
			});
			this.emailField.placeAt(this.form);
			this.emailField.startup();

			domConstruct.create('label', {
				'for': 'feedbackTextField',
				innerHTML: 'Your Feedback'
			}, this.form);

			this.feedbackField = new TextArea({
				id: 'feedbackTextField',
				name: 'feedbackText',
				placeHolder: 'Your Feedback',
				rows: 4,
				trim: true,
				title: 'Your Feedback'
			});
			this.feedbackField.placeAt(this.form);
			this.feedbackField.startup();

			this.browserInfoCheckBox = new CheckBox({
				checked: true,
				id: 'browserInfoCheckBox'
			});
			this.browserInfoCheckBox.placeAt(this.form);
			this.browserInfoCheckBox.startup();

			domConstruct.create('label', {
				'for': 'browserInfoCheckBox',
				innerHTML: 'Include browser information'
			}, this.form);

			this.submitButton = new Button({
				'class': 'button',
				duration: 0,
				label: 'Send',
				onClick: lang.hitch(this, this.submitForm)
			});
			this.submitButton.placeAt(this.form);
			this.submitButton.startup();

			this.successMessageNode = domConstruct.create('p', {
				'class': 'feedbackSuccess hidden',
				innerHTML: 'Thank you for your feedback<br><br>'
			}, this.containerNode);

			var returnToFormButton = new Button({
				'class': 'button',
				duration: 0,
				label: 'Back',
				onClick: lang.hitch(this, function() {
					domClass.remove(this.infoNode, 'hidden');
					domClass.remove(this.form, 'hidden');
					domClass.add(this.successMessageNode, 'hidden');
				})
			});
			returnToFormButton.placeAt(this.successMessageNode);

		},

		activate: function(e) {
			this.inherited(arguments);
			this.previousRoute = e.oldPath;

			domClass.remove(this.infoNode, 'hidden');
			domClass.remove(this.form, 'hidden');
			domClass.add(this.successMessageNode, 'hidden');

			toaster.clearMessages();
		},

		submitForm: function() {
			toaster.clearMessages();
			var name = this.nameField.get('value');
			var email = this.emailField.get('value');
			var feedback = this.feedbackField.get('value');
			var userAgent, dom, lastRoute;
			if (this.browserInfoCheckBox.get('checked')) {
				userAgent = navigator.userAgent;
				dom = document.documentElement.outerHTML;
				lastRoute = this.previousRoute;
			}
			else {
				userAgent = null;
				dom = null;
				lastRoute = null;
			}

			if (name.length === 0 || email.length === 0 || feedback.length === 0) {
				//Toaster.displayMessage({
				//	text: 'All fields are required'
				//}, this.domNode);
				toaster.displayMessage({
					text: 'All fields are required',
					type: 'error',
					time: -1
				});
				return;
			}

			domAttr.set(this.submitButton.domNode, 'disabled', 'disabled');
			var pi = new ProgressIndicator({
				center: false,
				size: 30,
				style: {
					'float': 'right',
					'marginTop': '15px'
				}
			});
			pi.placeAt(this.submitButton, 'after');
			pi.start();
			this.submitButton.set('label', 'Sending...');

			request(this.feedbackSubmissionURL, {
				data: {
					name: name,
					email: email,
					feedback: feedback,
					user_agent: userAgent,
					dom: dom,
					last_route: lastRoute
				},
				handleAs: 'json',
				method: 'POST'
			}).then(
				lang.hitch(this, function(response) {
					pi.stop();
					this.submitButton.set('label', 'Send');
					domAttr.remove(this.submitButton.domNode, 'disabled');
					if (response.status === 'success') {
						this.feedbackSuccessful();
					}
					else {
						this.feedbackFailed(response.message || 'Unable to submit feedback');
					}
				}),
				lang.hitch(this, function(err) {
					pi.stop();
					this.submitButton.set('label', 'Send');
					domAttr.remove(this.submitButton.domNode, 'disabled');
					this.feedbackFailed('Unable to submit feedback');
					console.error(err);
				}));

		},

		feedbackSuccessful: function() {

			this.feedbackField.set('value', '');

			domClass.add(this.infoNode, 'hidden');
			domClass.add(this.form, 'hidden');

			domClass.remove(this.successMessageNode, 'hidden');
		},

		feedbackFailed: function(message) {
			toaster.displayMessage({
				text: message,
				type: 'error'
			}, this.domNode);
		}

	});
});
