<?php
echo "Executing cronjob.php";
$nobil = "http://nobil.no/api/server/datadump.php?apikey=a1060d7d9c5a88b1a55e1a1a7cd6dacb&countrycode=NOR&format=json";
$data = file_get_contents($nobil);
$obj = json_decode($data);
echo "<pre>";

//Used to preview dump code. 
//var_dump($obj);

foreach($obj->chargerstations as $value) {
	echo "</br>";
	//General information about the station
    $station = $value->csmd;
    //More information about the charging station
    $attr = $value->attr->st;
    //The charging stations connectors. 
    $points = $value ->attr->conn;

    //Printing out the information
	foreach ($station as $key => $value) {
		echo "<b>". $key . "</b> - " . $value . "</br>";
	}
	//Printing out the information
	foreach ($attr as $value) {
		echo "<b>" . $value->attrname . "</b> - "  .  $value->trans . "</br>";
	}
	//Printing out the information
	foreach ($points as $value) {
		echo "</br>";
		$data = $value;
		//var_dump($value);
		foreach ($data as $value) {
			echo "<b>" . $value->attrname . "</b> - "  .  $value->trans . "' </br>";	 
		}	
		echo "</br>";
	}
	echo "</br></br>";
}
echo "</pre>";




//https://firebase.google.com/docs/reference/rest/database/
?>


