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
		'dojo/dom-class',
		'dojo/dom-construct',
		'dojo/on',
		'dojox/mobile/Audio',
		'dojox/mobile/Button',
		'dojox/mobile/Pane',
		'dojox/mobile/Slider',
		'app/util/dom-utils'
], function(declare, lang, domClass, domConstruct, on, Audio, Button, Pane, Slider, domUtils) {
	return declare([Pane], {

		'class': 'audioPlayer',

		// audio: dojox/mobile/Audio
		audio: null,

		// audioEventHandles: Array
		//     Array of dojo/on handles for audio event listeners.
		audioEventHandles: null,

		// loadingInterval: Number
		//     Interval between loading animations, in milliseconds
		loadingInterval: 200,

		// loadingIntervalId: Number
		//     Interval ID for loading icon animation
		loadingIntervalId: null,

		// playButton: dojox/mobile/Button
		//     Play/pause button.
		playButton: null,

		// selectedSource: Integer
		//     The index of the selected source in the sources array.
		selectedSource: 0,

		// sources: Array
		//     Array of url, type, and label (ex [{url: 'http://wsbf.net:8000/high', type: 'audio/mp3', label: '192 kbps'}])
		//     for sources to choose from.
		sources: null,

		// sourceButtons: Array
		//     Array of dojox/mobile/Buttons for selecting source to play from list.
		sourceButtons: null,

		// sourcesNode: DomNode
		//     Container for source select buttons.
		sourcesNode: null,

		// volumeSlider: dojox/mobile/Slider
		//     Slider to adjust the audio volume.
		volumeSlider: null,

		buildRendering: function() {
			this.inherited(arguments);

			this.playButton = new Button({
				'class': 'button playButton icon-play',
				duration: 0,
				currentIcon: 'play'
			});
			this.playButton.placeAt(this.domNode);
			this.playButton.startup();

			this.playButton.set('onClick', lang.hitch(this, function() {
				if (!this.audio || this.audio.domNode.paused) {
					console.log('playing ');
					this.play();
				} else {
					console.log('pausing');
					this.pause();
				}
			}));

			this.playButton.setIcon = lang.hitch(this.playButton, function(icon) {
				if (icon !== this.currentIcon) {
					domClass.replace(this.domNode, 'icon-' + icon, 'icon-' + this.currentIcon);
					this.currentIcon = icon;
					domUtils.cufonify();
				}
			});

			var volumeSliderContainer = domConstruct.create('div', {
				'class': 'volumeSliderContainer'
			}, this.containerNode);

			this.volumeSlider = new Slider({
				'class': 'volumeSlider',
				min: 0,
				max: 1.0,
				step: 0,
				orientation: 'H',
				intermediateChanges: true,
				value: 0.5
			});
			this.volumeSlider.placeAt(volumeSliderContainer);
			this.volumeSlider.startup();
			this.volumeSlider.set('onChange', lang.hitch(this, function(val) {
				if (this.audio) {
					this.audio.domNode.volume = val;
				}
			}));

			this.sourcesNode = domConstruct.create('div', {
				'class': 'sourcesContainer'
			}, this.domNode);
		},

		addSourceButton: function(/*Object*/ source, /*Integer*/ index) {
			// summary:
			//     Create a new button for selecting a source to play and place it in the DOM node.
			// source: Object
			//     The source tied to this button.
			// index: Integer
			//     The index of source in the this.sources array.

			var button = new Button({
				'class': 'button sourceButton',
				duration: 0,
				label: source.label
			});

			if (index == this.selectedSource) {
				domClass.add(button.domNode, 'selected');
			}

			button.set('onClick', lang.hitch(this, function() {

				var i;
				for (i = 0; i < this.sourceButtons.length; i++) {
					domClass.remove(this.sourceButtons[i].domNode, 'selected');
				}

				domClass.add(button.domNode, 'selected');

				this.set('selectedSource', index);
			}));

			this.sourceButtons.push(button);

			button.placeAt(this.sourcesNode);
		},

		_setSourcesAttr: function(/*Array*/ sources) {
			// summary:
			//     Set the list of available sources to choose from.

			this._set('sources', sources);
			domConstruct.empty(this.sourcesNode);
			this.pause();
			this.selectedSource = 0;
			this.sourceButtons = [];
			var i;
			for (i = 0; i < sources.length; i++) {
				this.addSourceButton(sources[i], i);
			}
		},

		pause: function() {
			// summary:
			//     Pause the audio.

			clearInterval(this.loadingIntervalId);
			this.playButton.setIcon('play');

			if (this.audio && !this.audio.paused) {

				var i;
				for (i = 0; i < this.audioEventHandles.length; i++) {
					this.audioEventHandles[i].remove();
				}

				this.audio.domNode.pause();
				this.audio.domNode.src = '';
				this.audio.destroy();
				this.audio = null;
			}
		},

		play: function() {
			// summary:
			//     Play the audio.

			var s = this.sources[this.selectedSource];
			this.audio = new Audio({
				source: [
					{src: s.url, type: s.type}
				]
			});
			this.audio.domNode.volume = this.volumeSlider.get('value');
			this.audio.placeAt(this.domNode);

			this.audioEventHandles = [];

			var handle = on(this.audio.domNode, 'loadstart', lang.hitch(this, function() {
				var currentIcon = 0,
					icons = {
						0: 'dot',
						1: 'dots',
						2: 'ellipsis'
					};
				var updateIcon = lang.hitch(this, function() {
					this.playButton.setIcon(icons[currentIcon]);
					currentIcon = (currentIcon + 1) % 3;
				});
				clearInterval(this.loadingIntervalId);
				this.loadingIntervalId = setInterval(updateIcon, this.loadingInterval);
				updateIcon();
			}));

			this.audioEventHandles.push(handle);

			handle = on(this.audio.domNode, 'loadeddata', lang.hitch(this, function() {
				clearInterval(this.loadingIntervalId);
				this.playButton.setIcon('pause');
			}));
			this.audioEventHandles.push(handle);

			handle = on(this.audio.domNode, 'error', lang.hitch(this, function() {
				// retry
				this.play();
			}));
			this.audioEventHandles.push(handle);

			this.audio.domNode.play();
		},

		_setSelectedSourceAttr: function(/*Integer*/ selectedSource) {
			// summary:
			//     Set which of the available sources to play.
			// selectedSource: Integer
			//     The index of the source to play in the this.sources array.

			this._set('selectedSource', selectedSource);

			// If the old source was playing, stop it and start playing the new source.
			if (this.audio && !this.audio.domNode.paused) {
				this.pause();
				this.play();
			}
		}

	});
});
