/*
Desired functions 
getMyPosLatLng()
getNearbyChargingStations() //Basere på filter?
calculateRoute()
getChargingStation(id)
getChargingStations(array)
getRealtimeData(id) //Eventuelt array av id. Denne kobles opp til websockets. */

// Good tutorial on google maps, https://www.joshmorony.com/integrating-google-maps-with-an-ionic-application/ part 3 tackles online/offline issues.
// which is based on: (connectivity issues) http://rohdef.dk/posts/Sencha-Touch-2-The-maps-connectivity-issue

var app = angular.module('echarge.map');

//Make our own document ready service. 
app.service('ReadyService', function($q, $timeout, $window, $document){
	
	var ready = $q.defer();
    this.isReady = ready.promise;


    angular.element(document).ready(function() {
        if (window.cordova) {
            document.addEventListener('deviceready', function(){
            	ready.resolve("Ready");
            }, false);
        } else {
            ready.resolve("Ready");
        }
    });

 /*   var online = $q.defer();
	var resume = $q.defer();
	var pause = $q.defer();

    this.isOnline = online.promise;
    this.isResumed = resume.promise;
    this.isPaused = resume.promise;

   	document.addEventListener("online", function(){
   		online.resolve("online");
   	});
   	document.addEventListener("resume", function(){
   		resume.resolve("resume");
   	});

   	document.addEventListener("pause", function(){
   		pause.resolve("pause");	
   	});
*/



});

app.service('MapService', function ($cordovaGeolocation, ReadyService, $firebaseObject, Database, $q, $rootScope, $timeout) {
	var eChargeMap = null;
	var geoFire = Database.geoFireRef;
	var userLat = null;
	var userLong = null;
	var lastpos = null;

	this.getLastPos = function(){
		return lastpos;
	}

	this.setLastPos = function(position) {
		lastpos = position;
	}


	this.getKeyLocation = function(key){
		Database.geoFire().get(key).then(function(location) {
		  if (location === null) {
		    console.log("Provided key:" +key+ " is not in GeoFire");
		  }
		  else {
	//	    console.log("Provided key " +key+ " has a location of " + location);
		  }
		}, function(error) {
		  console.log("Error: " + error);
		});
	}

	this.getNearby = function(lat, lon, range){
		var service = this

		if(lat && lon){
			//console.log("Lat and long is given", lat, lon);
			geoQuery(lat, lon);
		} else{
			console.log("Lat and lon is not given", lat, lon);
			//First check if device is ready, then get my pos, then do a geoQUery. 
			ReadyService.isReady.then(function(){
				//Get my pos
				service.getMyPosLatLng().then(position => {
					//Do geoquery 
					geoQuery(position.coords.latitude, position.coords.longitude)
				});	
			});
		}
		

		function geoQuery(lat, lon){
			//Must wait for load maps api... (So we have a map and are online). 
			var chargingStation = [];
			var geoQuery = Database.geoFire().query({
				center: [lat, lon],
				radius: range
			});

			//Try angular broadcast event. 
			//https://groups.google.com/forum/#!topic/firebase-talk/VUdy5yAhN1k

			var onKeyEnteredRegistration = geoQuery.on("key_entered", function(key, location, distance) {
			 //	console.log(key + " entered query at " + location + " (" + distance + " km from center)");
			 	chargingStation.push(key);

			 	$timeout(function(){
	                $rootScope.$broadcast('GEOFIRE:KEY_ENTERED', {key: key, location: location, distance: distance});
	            }, 3000);   


			});

			var onKeyExitedRegistration = geoQuery.on("key_exited", function(key, location, distance) {
			  //console.log(key + " exited query to " + location + " (" + distance + " km from center)");
				// Cancel all of the query's callbacks. we are done
				geoQuery.cancel();
			});	

			return chargingStation
		} 
		
		
	}

	this.getMyPosLatLng = function(){
		var options = {timeout: 10000, enableHighAccuracy: true};
		return $cordovaGeolocation.getCurrentPosition(options);
	}


});





	