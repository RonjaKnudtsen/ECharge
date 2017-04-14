// Initialize Firebase
var config = {
  apiKey: "AIzaSyDTg4SKi00kG6nz78Ur_ZsmCpo_whDpi_w",
  authDomain: "echarge-1472558145387.firebaseapp.com",
  databaseURL: "https://echarge-1472558145387.firebaseio.com",
  storageBucket: "echarge-1472558145387.appspot.com",
  messagingSenderId: "882540270930"
};

firebase.initializeApp(config);
  // Create a Firebase reference where GeoFire will store its information
//var firebaseRef = firebase.database().ref();
var database = firebase.database();
var rootRef = database.ref();
var firebaseRef = rootRef.child("location");
// Create a GeoFire index
var geoFire = new GeoFire(firebaseRef);




//var geoFire = geoFire.ref('/location');  // ref === firebaseRef
//These must be hidden
var email = "ronjark@gmail.com";
var password = "dogedogedogedoge";
firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
  var errorCode = error.code;
  var errorMessage = error.message;
});

//Generate empty charging stations.
$.getJSON("generate_empty_stations.php").then(function(data){
  console.log("Generate empty", data);

   rootRef.child("stations").set(data.stations)
  .then(function(){
    console.log("Empty stations generated");
  }, function(error){
    console.log("Error: "+ error);
  });

  
}, function(err){
  console.log("Error:",err);
});

/*
//When we get the formatted data, push it to the server
$.getJSON("cronjob_translate.php").then(function(data){
  console.log("GET JSON", data);
   
 // setGeoData(data);
 // pushData(data);
  //createStations(data);
   //RUN ONLY IF WE NEED TO EMPTY: empty();
  
}, function(err){
  console.log("Error:",err);
});
*/

//Functions

function createStations(data){
  console.log("station;", data.station);
}

//This will overwrite everything in root. Just for testing purposes. 
function pushData(data) {
  console.log("Pushing information...");

  rootRef.child("info-chargingpoints").set(data.chargingpoints)
  .then(function(){
    console.log("All chargingpoints updated");
  }, function(error){
    console.log("Error: "+ error);
  });

  rootRef.child("info-chargerstations").set(data.chargerstations)
  .then(function(){
  console.log("All chargingstations updated");
  }, function(error){
  console.log("Error: "+ error);
  });
 


//  firebase.database().ref('/info-chargingpoints').set(data.chargingpoints);
 // firebase.database().ref('/info-chargerstations').set(data.chargerstations);
}
//THis empties everything. DONT USE THIS UNLESS NESSECARY.
function empty(){
  firebase.database().ref('/info-chargerstations').set("");
  firebase.database().ref('/info-chargingpoints').set("");
  firebase.database().ref('/location').set("");
}
function setGeoData(data){
  for(key in data.location){
    geoFire.set(key, data.location[key]).then(function(){
      console.log("Added location");
    }, function(error){
      console.log("Error" + error);
    });
  }
 /* data.location.forEach(function(entry){
    console.log(entry);
  }):
  /*geoFire.set(data.location).then(function() {
    console.log("Provided key has been added to GeoFire");
  }, function(error) {
    console.log("Error: " + error);
  });*/

}
function writeUserData(userId, name, email, imageUrl) {
  firebase.database().ref('users/' + userId).set({
    username: name,
    email: email,
    profile_picture : imageUrl
  });
}