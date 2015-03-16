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
class Store{

	public function query($type){
		return json_decode(file_get_contents($type.".json"),true);
	}

	public function update($type, $item_key, $data){
		$item_key = urldecode($item_key);

		$doc = json_decode(file_get_contents($type.".json"),true);

		if(isset($data['color'])){
			$data['color'] = intval($data['color']);
		}

		$items = $doc['items'];

		$itemIndex = -1;

		for($i=0,$l=count($items);$i<$l;$i++){
			if($item_key == $items[$i]['data']['objectId']){
				$itemIndex = $i;
				break;
			}
		}

		if($itemIndex == -1){
			//unknown item
			return array();
		}
		
		$item = &$doc['items'][$itemIndex];

		foreach ($data as $key => $value) {
			$item['data'][$key] = $value;
		}

		file_put_contents($type.".json", json_encode($doc));

		return array();
	}

	public function create($data_type, $request){

		$doc = json_decode(file_get_contents($data_type.".json"),true);

		$data = $request['data'];
		$item_type = $request['properties']['type'];
		$props = $doc['properties']['create_properties'][$item_type];

		if(isset($data['color'])){
			$data['color'] = intval($data['color']);
		}

		$id = $data_type.'#'.$item_type.'#';
		$counter=0;
		//figure out what the objectId should be
		for($i=0,$l=count($doc['items']);$i<$l;$i++){
			if(strpos($doc['items'][$i]['data']['objectId'], $id) !== false){
				$counter++;
			}
		}
		$data['objectId'] = $id.$counter;
		$data['objectURI'] = $data_type.'/'.urlencode($id.$counter);
		$item = array('properties'=>$props, 'data' => $data);

		array_push($doc['items'], $item);

		file_put_contents($data_type.".json", json_encode($doc));
	}

	public function delete($type, $item_key){
		$item_key = urldecode($item_key);
		$doc = json_decode(file_get_contents($type.".json"),true);
		//echo "DELETE $type $item_key";
		$items = $doc['items'];

		$itemIndex = -1;

		for($i=0,$l=count($items);$i<$l;$i++){
			if($item_key == $items[$i]['data']['objectId']){
				$itemIndex = $i;
				break;
			}
		}

		if($itemIndex == -1){
			//unknown item
			return array();
		}

		array_splice($doc['items'], $itemIndex, 1);

		file_put_contents($type.".json", json_encode($doc));

		return array();
	}

}

?>