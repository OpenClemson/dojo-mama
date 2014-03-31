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

// dojo-mama configuration
define({

	/* Title attributes */
	title: 'dojo-mama <span style="font-weight:normal">demo</span>',
	titleLabel: 'dojo-mama demo',

	/* Navigation */
	nav: {
		/* navigational elements; each element is a module key */
		primary: [
			'example',
			'crudExample'
		],
		/* secondary links show up in the meta nav: */
		secondary: [
			'help',
			'feedback'
		]
	},

	/* Optional global configuration, accessible by all modules */
	networkTimeout: 15000,

	/* Module configuration */
	modules: {
		/* use the default index, or make your own */
		index: {
			moduleId: 'app/index/Module'
		},

		/* Primary */
		example: {
			title: 'Example',
			moduleId: 'app/example/Module'
		},
		crudExample: {
			title: 'Crud Example',
			moduleId: 'app/crudExample/Module',
			modules: ['veggies', 'fruits']
		},

		/* Secondary  */
		feedback: {
			title: 'Feedback',
			moduleId: 'app/feedback/Module',
			linkText: true
		},
		help: {
			title: 'Support',
			moduleId: 'app/help/Module',
			linkText: true
		},

		/* Module Groups */
		veggies: {
			title: 'Veggies',
			moduleId: 'app/crudExample/veggies/Module',
			selectedPrimaryNavItem: 'Veggies',
			baseServiceUrl: 'srv/crudExample/'
		},

		fruits: {
			title: 'Fruits',
			moduleId: 'app/crudExample/fruits/Module',
			selectedPrimaryNavItem: 'fruits',
			baseServiceUrl: 'srv/crudExample/'
		}

	}
});
