<?php
/*
dojo-mama: a JavaScript framework
Copyright (C) 2015 Omnibomd Systems LLC

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

require_once('Store.php');

$url = $_SERVER['REQUEST_URI'];

$url = explode('?', $url);

$url = $url[0];

$dir = dirname($_SERVER['SCRIPT_NAME']).'/';

$restPoint = explode($dir, $url);

if(!isset($restPoint[1])){
	throw new Exception('nope.');
}

$restPoint = $restPoint[1];


$store = new Store();

if($_SERVER['REQUEST_METHOD'] == 'GET'){

	echo json_encode($store->query($restPoint));

}elseif($_SERVER['REQUEST_METHOD'] == 'POST'){
	$restParts = explode('/', $restPoint);

	$entityBody = file_get_contents('php://input');
	$requestBody = json_decode($entityBody, true);

	$len = count($restParts);
	if($len === 1){
		echo json_encode($store->create($restParts[0],$requestBody));
	}elseif($len === 2){
		echo json_encode($store->update($restParts[0],$restParts[1],$requestBody));
	}else{
		//wtf
	}
}elseif($_SERVER['REQUEST_METHOD'] == 'DELETE'){
	$restParts = explode('/', $restPoint);

	echo json_encode($store->delete($restParts[0],$restParts[1]));
}else{
	//wtf
}

?>