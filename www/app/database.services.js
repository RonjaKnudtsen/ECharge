var app = angular.module('echarge.database');

var config = {
	apiKey: "AIzaSyDTg4SKi00kG6nz78Ur_ZsmCpo_whDpi_w",
    authDomain: "echarge-1472558145387.firebaseapp.com",
    databaseURL: "https://echarge-1472558145387.firebaseio.com",
    storageBucket: "echarge-1472558145387.appspot.com",
    messagingSenderId: "882540270930"
};

firebase.initializeApp(config);

//App.config is run before controllers and services.
app.config(function($firebaseRefProvider) {
	$firebaseRefProvider.registerUrl({
		default: config.databaseURL,
		cStation: config.databaseURL + "/info-chargerstations/",
		cPoint: config.databaseURL + '/info-chargingpoints/',
		stations: config.databaseURL + "/stations/",
		userInfo: config.databaseURL + "/users/",
	});

});

app.service('Database', function(firebase, $firebaseRef){
	//Using angulars $firebaseref is not working with geofire. 
	//So we go vanilla.
	var firebaseRef = firebase.database().ref().child("location");
	//Create a geofire index.
	var geoFire = new GeoFire(firebaseRef);

	//GeoFire reference.
	this.geoFireRef = function(){
		var ref = geoFire.ref();
	}
	this.geoFire = function(){
		return geoFire;
	}

	//Station ref (Fore extra station info like checked in etc, not from Nobil)
	this.stationRef = function(id){
		if(id){
			return $firebaseRef.stations.child(id)
		} else{
			return $firebaseRef.stations
		}
	}

	//User info ref (For extra user info)
	this.userInfoRef = function(uid){
		if(uid){
			return $firebaseRef.userInfo.child(uid)
		} else{
			return $firebaseRef.userInfo
		}
	}

	this.userStatisticsRef = function(uid){
		return $firebaseRef.userInfo.child(uid+"/statistics");
	}

	// All firebase refs defined above. 
	this.rootRef = function(){
		return $firebaseRef
	}
	// Charging station Reference.
	this.cStationRef = function(id){
		if(id){
			return $firebaseRef.cStation.child(id)
		} else{
			return $firebaseRef.cStation
		}
	}
	//Returns charging point reference
	this.cPointRef = function(id){
		if(id){
			return $firebaseRef.cPoint.child(id);
		} else{
			return $firebaseRef.cPoint
		}
	}
	//Returns auth. 
	this.auth = function(){
		return firebase.auth();
	}
});

