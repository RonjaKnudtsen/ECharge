<?php

$nobil = "http://nobil.no/api/server/datadump.php?apikey=a1060d7d9c5a88b1a55e1a1a7cd6dacb&countrycode=NOR&format=json";
$data = file_get_contents($nobil);
$obj = json_decode($data, true);

$new_stations = array(
	"stations" => array(),
);


foreach($obj["chargerstations"] as $value) {	

	//General information about the station
    $station = $value["csmd"];
    $id = $station["id"];

    $new_stations["stations"][$id] = array(
    	'key' => $id,
    );

    //Debug: var_dump($new_stations);


};

echo json_encode($new_stations);
