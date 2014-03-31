<?php
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
	


//this file should display or redirect to a login page.
//but for the demos let's just give them a session id and send them back to the app

session_start();

if(isset($_SESSION['authenticated']) && $_SESSION['authenticated'] === true){
	echo '{"authenticated":true,"username":"JOEUSER", "name":"Joe User"}';
}else{
	echo '{"authenticated":false}';
}

?>