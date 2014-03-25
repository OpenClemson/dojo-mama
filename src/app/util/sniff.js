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
		'dojo/has'
], function(declare, has) {
	// module:
	//     app/videos/utils

	var Sniff = declare([], {
		isEmbedCapable: function() {
			// Firefox on Windows with Flash plugin is stupid for some reason
			// IE8 and below can suck it
			var hasFlash = false,
				isFirefoxFlashWindows = false,
				isCrappyIE = false;

			if (navigator.mimeTypes && navigator.mimeTypes['application/x-shockwave-flash'] !== undefined) {
				hasFlash = true;
			}
			if (has('ff') && navigator.appVersion.toLowerCase().indexOf('windows') !== -1 && hasFlash) {
				isFirefoxFlashWindows = true;
			}
			if (has('ie') < 9) {
				isCrappyIE = true;
			}
			return (!(isFirefoxFlashWindows || isCrappyIE));
		},
		isGalaxyS4: function() {
			// Special case for the Samsung Galaxy S4, which has broken CSS rendering
			var gs4ModelNumbers = ['GT-I9500', 'SHV-300K', 'SHV-300L', 'SHV-300S', 'GT-I9505',
				'GT-I9505G', 'SGH-I337', 'SGH-M919', 'SCH-I545', 'SPH-L720', 'SCH-R970',
				'GT-I9506', 'GT-I9508', 'SCH-I959', 'GT-I9502', 'SGH-N045'];
			var gs4Regex = new RegExp('Samsung ' + gs4ModelNumbers.join('|'), 'gi');
			return gs4Regex.test(navigator.userAgent);
		},
		isWindowsPhone: function() {
			return navigator.userAgent.match(/Windows Phone/);
		},
		isIE: function() {
			// account for IE11, too!
			return (has('ie') || (navigator.appName == 'Microsoft Internet Explorer') ||
					((navigator.appName == 'Netscape') &&
					(new RegExp("Trident/.*rv:([0-9]{1,}[.0-9]{0,})").exec(navigator.userAgent) != null)));
		}
	});

	return new Sniff();
});
