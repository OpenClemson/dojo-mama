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

header('Content-type: application/json');

$hostname = gethostname();
$EMAIL_SUBJECT = 'Feedback: ' . $_POST['name'];
$EMAIL_BODY = "Feedback for my app
Name: {$_POST['name']}
Email: {$_POST['email']}
Feedback: 
-------------------------------------------------
{$_POST['feedback']}
-------------------------------------------------

Host:  $hostname

User Agent: {$_POST['user_agent']}

Last Route: {$_POST['last_route']}

DOM: 
---------------------------------------------------
{$_POST['dom']}
---------------------------------------------------
";


foreach (array('name', 'email', 'feedback') as $field) {
	if (!isset($_POST[$field]) || strlen(trim($_POST[$field])) === 0) {
		echo json_encode(array('status' => 'error', 'message' => 'All fields are required'));
		die;
	}
}

mail('whoever@example.com', $EMAIL_SUBJECT, $EMAIL_BODY, 'From: feedback@example.com');

echo json_encode(array('status' => 'success'));
