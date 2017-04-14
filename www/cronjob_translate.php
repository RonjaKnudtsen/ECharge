<?php
$nobil = "http://nobil.no/api/server/datadump.php?apikey=a1060d7d9c5a88b1a55e1a1a7cd6dacb&countrycode=NOR&format=json";
$data = file_get_contents($nobil);
$obj = json_decode($data, true);

/*Used to preview dump code. 
echo "<pre>";
var_dump($obj);*/

$chargerstations = array();
$chargingpoints = array();
$location = array();

//Chargingspeed (only for fast chargers. ):
//More info: https://www.ladestasjoner.no/hurtiglading/om-hurtiglading/24-hva-er-hurtiglading
//See charging capacity: http://nobil.no/admin/attributes.php
$chargingpointTrans = array (
	"accessibility" => "Tilgjengelighet",
	"chargemode" => "Lademodus",
	"chargingcapacity" => "Ladekapasitet",
	"connector" => "Ladekabel",
	"connector_charger" => "Ladekabel og kapasitet",
	"fixed_cable" => "Fast kabel",
	"reservable" => "Reserverbart",
	"vehicletype" => "Kjøretøy",
	);

$chargingSpeed = array(
	"22 kW - 400V 3-phase max 32A" => "Semihurtiglading",
	"43 kW - 400V 3-phase max 63A" => "Hurtigladepunkt AC",
	"50 kW - 500VDC max 100A" => "Hurtigladepunkt DC",
	"100 kW - 500VDC max 200A" => "Hurtigladepunkt DC Tesla",
);
$chargingTime = array(
	"22 kW - 400V 3-phase max 32A" => "35-50 minutter",
	"43 kW - 400V 3-phase max 63A" => "20-30 minutter",
	"50 kW - 500VDC max 100A" => "20-30 minutter",
	"100 kW - 500VDC max 200A" => "ca 1 time",
);

//Charging station translations: 
$chargerstationTranslations = array(
	"name" => "Navn",
	"Description_of_location" => "Beskrivelse",
	"Owned_by" => "Eies av",
	"Number_charging_points" => "Antall ladepunkter",
	"Available_charging_points" => "Tilgjengelige ladepunkter",			
	"Contact_info" => "Kontaktinformasjon",
	"Created" => "Laget",
	"Updated" => "Oppdatert",
	"Station_status" => "Status på ladestasjon",
);
$labelTranslations = array(
	"Open 24h" => "Døgnåpen",
	"Real-time information" => "Sanntidsinformasjon",
	//"Public funding" => "Offentlig finansiert",
	"Parking fee" => "Parkeringsavgift",
	"Time limit" => "Tidsbegrensning",
	"Location" => "Lokasjon",
	"Availability" => "Tilgjengelighet",
	"Connector Error status" => "Tilkoblingsfeil",
	"Connector status" => "Tilkoblingsstatus",
);

$valueTranslations = array(
	"Street" => "Gate",
	"Car park" => "Parkeringshus",
	"Airport" => "Flyplass",
	"Shopping center" => "Kjøpesenter",
	"Transport hub" => "Knutepunkt",
	"Hotels and serving" => "Hotel og restauranter",
	"Energy station" => "Energistasjon",
	"Public" => "Offentlig",
	"Visitors" => "Besøkende",
	"Employees" => "Ansatte",
	"By appointment" => "Etter avtale",
	"Residents" => "Beboere",
	"Yes" => "Ja",
	"No" => "Nei", 
	"None" => "Ingen",
	"Open" => "Åpen",
	"Standard key" => "Standardnøkkel",
	"Other" => "Annet",
	"RFID" => "RFID",
	"Payment" => "Betaling",
	"Cellular phone" => "Mobilbetaling",
	"VISA and Mastercard" => "VISA og Mastercard",
	"Mastercard and VISA" => "VISA og Mastercard",
	"American Express" => "American Express",
	"Diners" => "Diners",
	"Other cards" => "Andre kort",
	"Subscription" => "Abonnement",
	"Coin machine" => "Betalingsautomat",
	"Miscellaneous Cards" => "Diverse kort",
	"Miscellaneous" => "Diverse",
	"Cellular phone and Charging card" => "Mobilbetaling og ladekort",
	"VISA, Mastercard, Charging card" => "VISA, Mastercard eller ladekort",

	"Vacant" => "Ledig",
	"Busy" => "Opptatt",

);

/* Other data we wont translate/dont need.
	Street
	House_number
	Zipcode
	City
	Municipality_ID
	Municipality
	County_ID
	County

	Position => "",
	Image => "",
	User_comment => "",
	Land_code => "",
	International_id => "",
	id => "id",
*/


foreach($obj["chargerstations"] as $value) {	
	//General information about the station
    $station = $value["csmd"];
    //More information about the charging station
    $attr = $value["attr"]["st"];
	//The individual chargign points for the station.   
    $points = $value["attr"]["conn"];
    $id = $station["id"];


    //Save position information
    //Remove parenthesis, split by comma and convert from int.
    $position = $station["Position"]; 
    $position = preg_replace('/\(|\)/','',$position);
    $positionarr = explode( ',', $position );
    $positionarr[0] = (float)$positionarr[0];
    $positionarr[1] = (float)$positionarr[1];    
    $location[$id] = $positionarr;

    foreach ($station as $key => $value){

    	$chargingpoints[$id] = array();
    	$chargerstations[$id][$key] = array();
    	$chargerstations[$id][$key]["key"] = $key;
    	$chargerstations[$id][$key]["value"] = $value;

    	//If we have a translated variant of the key, include this.
    	//Makes it easier for us to generate labels in the app. 
    	foreach($chargerstationTranslations as $transKey => $translation){
    		if($transKey == $key){
    			$chargerstations[$id][$key]["trans"] = $translation;
    		}
		}

    	 //Initialize a new charging point array for each of the stations. 
    }   

     
	//Some information for the chargingstation is stored differently:
	foreach ($attr as $value) {	
		$key = $value["attrname"];

		foreach($labelTranslations as $labelKey => $labelTranslation){
			//Compare the labelKey in labeltranslation against the key in nobil.
			//If we get a match, append the labeltranslation.
    		if($labelKey == $key){
    			$chargerstations[$id][$key] = array();
    			$chargerstations[$id][$key]["key"] = $key;
    			$chargerstations[$id][$key]["trans"] = $labelTranslation;

    			//Translate the value.  
    			foreach($valueTranslations as $transKey => $valueTranslation){
		    		if($transKey == $value["trans"]){
		    			$chargerstations[$id][$key]["value"] = $valueTranslation;

		    		}
				}			
    		}
		}
	}



/*
How it is stored in the database:

"chargingstationID" : {
	"conn" : {
		"4": {
	          "attrtypeid": "4",
	          "attrname": "Connector",
	          "attrvalid": "14",
	          "trans": "Schuko CEE 7/4",
	          "attrval": ""
	        }
	}
}


Example of how we want it stored: 
"chargingpoints" : {
	"chargingstationIdY" : {
		"key" : "chargingstationIdX",
		"connector": 
			key: connector,
			name: Connector,
			"group" : 
				"schuko" : {
					count: 2,
					name: Shucko,
					key: shucko,
				},
			},
		},
	}
}
*/

	//Printing out the information
	foreach ($points as $value) {
	//	echo "</br>";
		$data = $value;
		//var_dump($value);
		//attrtypeid
		$id = $station["id"];
		$chargingpoints[$id]["key"] = $id;
		

		/* Combinations
		* We want to generate a table with combinations, 
		* in order to check wether the connector type has the correct charging capacity. 
		*/
		if(!array_key_exists("connector_charger", $chargingpoints[$id])){			
			$chargingpoints[$id]["connector_charger"]["key"] = "connector_charger";
			$chargingpoints[$id]["connector_charger"]["name"] = "Connector and charger combo";
			$chargingpoints[$id]["connector_charger"]["combo"] = array();
		}

		//Connector:
		$conn = makeKey($data["4"]['trans']);
		//Charging capacity:
		$char = makeKey($data["5"]['trans']);		
		//New combined key
		$combination = $conn ."-" . $char;

		
		if(!array_key_exists($combination, $chargingpoints[$id]["connector_charger"]["combo"])){
				$chargingpoints[$id]["connector_charger"][$combination]["combo"]["key"] = $combination;
				$chargingpoints[$id]["connector_charger"][$combination]["combo"]["count"] = 1;
				$chargingpoints[$id]["connector_charger"][$combination]["combo"]["name"] = $value["4"]["trans"] . " & " . $value["5"]["trans"];
		} else{
			$chargingpoints[$id]["connector_charger"][$combination]["combo"]["count"] ++;
		}
		

		foreach ($data as $info) {
			//if not existing, initialize it. 
			//Category i.e "Connector", and value can be "Schuko CEE 7/4", there can be multiple shuckos in one charging station.. 
			//$category = $info["attrname"];
			$categoryKey = $info["attrname"];
			//$categoryKey = makeKey($category);

			$value = $info["trans"];
			//$valueKey = makeKey($value);


			//First create the category, i.e "Connector" if not already existing. 
			//the key is a url-friendly name. 
			// If the categoryKey is NEW, eg. "Chargingpoint" make a new array. 
			if(!array_key_exists($categoryKey, $chargingpoints[$id])){

				$chargingpoints[$id][$categoryKey]["key"] = $categoryKey;
				$chargingpoints[$id][$categoryKey]["name"] = $categoryKey;

				//Add translation 
				foreach($chargingpointTrans as $transKey => $translation){
		    		if($transKey == $categoryKey){
		    			$chargingpoints[$id][$categoryKey]["trans"] = $translation;
		    		}
				}			

				$chargingpoints[$id][$categoryKey]["group"] = array();	
			} 

			//If the VALUE is new, add it, if not count it. 
			
			// THe value here can be  Schuko CEE 7/4. Placing  Schuko CEE 7/4 in Connectors. 
			if(!array_key_exists($valueKey, $chargingpoints[$id][$categoryKey]["group"])){	

				//Create more meaningful names than Yes or No. 
				/*if($categoryKey == "fixedcable"){
					if($value == "No"){
						$value = "Ikke fast kabel";
					} else if ($value =="Yes"){
						$value = "Fast kabel";
					}
				} else if($categoryKey == "reservable"){
					if($value == "No"){
						$value = "Ikke reserverbart";
					} else if ($value =="Yes"){
						$value = "Reserverbart";
					}
				}*/

				//Add key to group.		
				$chargingpoints[$id][$categoryKey]["group"][$valueKey]["key"] = $valueKey;

				//Add value to group.
				//In case we dont get a translation save the standardvalue: 
				
				foreach($valueTranslations as $transKey => $valueTranslation){
		    		if($transKey == $value){
		    			$chargingpoints[$id][$categoryKey]["group"][$valueKey]["name"] = $valueTranslation;
		    		} else{
		    			$chargingpoints[$id][$categoryKey]["group"][$valueKey]["name"] = $value;
		    			echo "No value trans ". $value;
		    		}
				}

				//Set counter as 1. 
				$chargingpoints[$id][$categoryKey]["group"][$valueKey]["count"] = 1;

				//We want to add additional information about speed based on chargingcapacity.
				//See chargingspeed array at top. 
				if($categoryKey == "chargingcapacity"){

					$chargingpoints[$id]["speed"]["group"][$valueKey]["value"] = "Normallading";
			    	$chargingpoints[$id]["speed"]["group"][$valueKey]["count"] = 1;

					foreach($chargingSpeed as $capacity => $speed){
			    		if($capacity == $value){
			    			//The speeds key is set to the capacity-key so its easier for us to count it afterwards.
			    			//and we dont need the key.
			    			$chargingpoints[$id]["speed"]["group"][$valueKey]["value"] = $speed;		
			    		}
					}					
				}

			}	else{
				//If already existing, increase the number. 
				$chargingpoints[$id][$categoryKey]["group"][$valueKey]["count"] ++;

				//Need to check for speed and increase the counter
				if($categoryKey == "connector_charger"){
					$chargingpoints[$id]["speed"]["group"][$valueKey]["count"] ++;
				}
			}

		}
	}
}



//Combine them togheter. 
$output = array();
$output["chargingpoints"] = $chargingpoints;
$output["chargerstations"] = $chargerstations;
$output["location"] = $location;


echo json_encode($output);

/*debugging:
var_dump($output);
echo("</pre>");*/


function makeKey($string){
	//Make lowercase, then remove everything that is not lowercase. 
	return preg_replace('/[^a-z]/', "", strtolower($string));
}


//https://firebase.google.com/docs/reference/rest/database/
?>


