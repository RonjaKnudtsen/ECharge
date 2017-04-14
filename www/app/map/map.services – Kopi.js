/*
Desired functions 
getMyPosLatLng()
getNearbyChargingStations() //Basere på filter?
calculateRoute()
getChargingStation(id)
getChargingStations(array)
getRealtimeData(id) //Eventuelt array av id. Denne kobles opp til websockets. */


var app = angular.module('echarge.map');

app.service('MapService', function ($cordovaGeolocation, $firebaseObject, Database, $q) {
	var eChargeMap = null;

	var geoFire = Database.geoFireRef;

	this.getKeyLocation = function(key){
		Database.geoFire().get(key).then(function(location) {
		  if (location === null) {

		    console.log("Provided key:" +key+ " is not in GeoFire");
		  }
		  else {
		    console.log("Provided key " +key+ " has a location of " + location);
		  }
		}, function(error) {
		  console.log("Error: " + error);
		});
	}

	this.getNearby = function(){
		var service = this;

		document.addEventListener("deviceready", onDeviceReady, false);

		function onDeviceReady() {
			var latlng = service.getMyPosLatLng();
			console.log("LATLONG");
			console.log(latlng);

			service.getMyPosLatLng().then(latlng => {
				console.log("LATLONG");
				console.log(latlng);
			});

			//Must wait for load maps api... (So we have a map and are online). 
			var geoQuery = Database.geoFire().query({
				center: [59.911, 10.757],
				radius: 10.5
			});

			var onKeyEnteredRegistration = geoQuery.on("key_entered", function(key, location, distance) {
			  console.log(key + " entered query at " + location + " (" + distance + " km from center)");
			});

			var onKeyExitedRegistration = geoQuery.on("key_exited", function(key, location, distance) {
			  console.log(key + " exited query to " + location + " (" + distance + " km from center)");

			  // Cancel all of the query's callbacks
			  geoQuery.cancel();
			});
		}

		
		//console.log(geoQuery);
	}

	this.getMap = function (){
		//Returns null if no map is initialized yet. 
		//OR we could just execute loadMapsApi.. 
		return eChargeMap; 
	}

	//This function checks if we are online and loads the maps api. 
	//THis is used to inialize the map. 
	this.loadMapsApi = function (){
		var service = this;
		//When device is ready; execute "onDeviceReady()".
		document.addEventListener("deviceready", onDeviceReady, false);

		function onDeviceReady () {
			console.log("deviceready");
		    document.addEventListener("online", onOnline, false);
		    document.addEventListener("resume", onResume, false);
		    loadMapsApi();
		}

		function onOnline () {
		    loadMapsApi();
		}

		function onResume () {
		    loadMapsApi();
		}

		function loadMapsApi () {
		    var googleMapApi = "https://maps.googleapis.com/maps/api/js?key=AIzaSyAZbFF-aiiBkdH8aP_jhxWgcElCdC7PbIA&sensor=true";
		    $.getScript(googleMapApi)
			  .done(function( script, textStatus ) {
			    console.log( textStatus );
			    onMapsApiLoaded();
			  })
			  .fail(function( jqxhr, settings, exception ) {
			   	console.log("Error: "+jqxhr);
			});
		} // End of loadMapsApi
		
		function onMapsApiLoaded () {
			//Center on OSLO or NORWAY until we get my pos. 
			var defaultPos = new google.maps.LatLng(59.911, 10.757);
			
			var isLoaded = new Promise();

			//Default map options. 
			var mapOptions = {
			  center: defaultPos,
			  zoom: 15,
			  mapTypeId: google.maps.MapTypeId.ROADMAP,
			  disableDefaultUI: true
			};

			//Create a map. !! SHOULD BE A GLOBAL OBJECT
			eChargeMap = new google.maps.Map(document.getElementById("map"), mapOptions);

			//Get myPOS, then make marker and center. 
			service.getMyPosLatLng().then(latlng => {
				//Create marker.
			    var marker = new google.maps.Marker({
			      position: latlng,
			      map: eChargeMap,
			      title: 'Min posisjon'
			    });
			    //Center map on position.
			    eChargeMap.setCenter(latlng);
			    isLoaded.resovle("Success");
			}).catch(error => {
				console.log("Could not get myPos" + error);
				isLoaded.reject("Could not get myPos");
			});		

			return isLoaded;

		};//End of onMapsApiLoaded()

	} // End of this.loadMapsAPI


	this.getMyPosLatLng = function(){
		var options = {timeout: 10000, enableHighAccuracy: true};

		return $cordovaGeolocation.getCurrentPosition(options)
		.then(function(position){
			var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
			return latLng
		}, function(error){
			console.log("Could not get location "+ error);
			return error
		});
	}
});

