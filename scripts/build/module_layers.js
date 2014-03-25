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

/* generate build layers based on dmConfig modules */

/*global process,require,define*/
(function() {
    var app = process.argv[2] || 'app',
        app_layers = ['main', 'run', 'dmConfig'],
        dmConfig = '../../src/' + app + '/dmConfig',
        script = '';

    define = function(dmConfig) {
        var module, modules, mid, mids = {};
        modules = dmConfig.modules;
        for (module in modules) {
            if (modules.hasOwnProperty(module)) {
                mid = modules[module].moduleId;
                if (mid && !mids[mid]) {
                    script += 'profile.layers["' + mid + '"] = {};\n';
                    mids[mid] = true;
                }
            }
        }
    };
    require(dmConfig);

    script += 'profile.layers["dojo/dojo"].include.push(';
    script += app_layers.map(function(layer) {
        return '"' + app + '/' + layer + '"';
    }).join(', ');
    script += ');';

    console.log(script);

}());
