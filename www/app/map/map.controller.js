var app = angular.module('echarge.map');

app.controller('station-controller', function($scope, $state, $stateParams, cStationService){
    var stationID = $state.params.stationID;
    $scope.cStation = cStationService.getCStation(stationID);
    $scope.cPoint = cStationService.getCPoint(stationID);
    $scope.iconlist = {};
   
    //Initializing menutabs
    $scope.tabs = [
    { name: 'station', heading: "Ladestasjon", route : "station({stationID: '" + stationID + "'})", active: true },
    { name: 'comments', heading: "Kommentarer", route : "station.comments({stationID: '" + stationID + "'})", active: false },
    { name: 'checkin', heading: "Innsjekking", route : "station.checkin({stationID: '" + stationID + "'})", active: false },
    //  { name: 'notification', faicon: 'fa-comment', heading: "Varsler", route: "", active: false },
    ];


    $scope.cPoint.$loaded().then(function(info){
         $scope.iconlist = {
            speed: info["speed"],
            accessibility: info["accessibility"],
            fixedcable: info["fixedcable"],
            reservable: info["reservable"],
            connector_charger: info["connector_charger"], //connector and charger in one. 
            connector: info["connector"],
            chargingcapacity: info["chargingcapacity"],
         }

         //append this to accessibility
         //$scope.iconlist.accessibility["payment_method"] = info["paymentmethod"], 
    });
    
    $scope.cStation.$loaded().then(function(info){
        $scope.gridInfo = {
            open24 : info["Open 24h"],
            realtime : info["Real-time information"],
            timeLimit: info["Time limit"],
            availability: info["Availability"],
            location: info["Location"],
            owned_by: info["Owned_by"],
        }
    });

});


app.controller('map-controller', function(NgMap, $cordovaGeolocation, $state, $scope, MapService, cStationService, ReadyService, $stateParams){

    $scope.googleMapsUrl="https://maps.googleapis.com/maps/api/js?libraries=places&key=AIzaSyAZbFF-aiiBkdH8aP_jhxWgcElCdC7PbIA";
    $scope.chargingstations = {};
    $scope.map = "";
    $scope.GPSEnabled = 0;
    $scope.directionsEnabled = 0;
    $scope.position = MapService.getLastPos();

    //Wait for Phone to be ready:
    //Check if we already have a position. (Typically when reentering a state).
    ReadyService.isReady.then(function(){

        //Wait for google (ngMap)
        NgMap.getMap().then(function(map) {

            //Check if we have a position stored. 
            if($scope.position){
                centerAndGetNearby($scope.position);                
                console.log("FROM ORIGIN:", $scope.position);

            } else {
                 //Get my pos if GPS is enabled and permission fulfilled. 
                MapService.getMyPosLatLng().then(position => {
                    //Set gps as enabled since we recieved a successfull promise.
                    $scope.GPSEnabled = 1;

                    //Check if we have changed position.
                    if(!$scope.position || $scope.position.latitude != position.coords.latitude){
                        console.log("Position is new or have changed", $scope.position, position.coords);  
                             

                        //Convert from cordova latlng to google map latlng
                        //GOOGLE IS NOT DEFINED. 
                        var userLatLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                        MapService.setLastPos(userLatLng);
                        console.log("USER LAT LNG",userLatLng);
                        //$scope.position = {lat: userLatLng.lat(), lng: userLatLng.lng()};
                        $scope.position = userLatLng;

                        console.log($scope.positions);
                        
                        
                        centerAndGetNearby(userLatLng);
                        //$scope.fromOrigin = $scope.positions;

                        console.log("FROM ORIGIN:", $scope.fromOrigin);
                    }

                }, function(err){
                    console.log("Could not get position", err);
                    $scope.GPSEnabled = false;
                });  

            } // end of else


        });
        console.log("SCOPE POSITION", $scope.position);


              

    }, function(err){
        console.log("Error loading cordova: ",err);
    });

    //Center the map 
    centerOnly = function (position){
        //Get map     
        NgMap.getMap().then(function(map) {
            $scope.map = map;
            map.setCenter(position);
            map.setZoom(15);      
               
        });
    }

    //Center the map, set marker icon and get nearby. 
    centerAndGetNearby = function(position){
        range = 1; //should get this from scope.
        centerOnly(position);       
        //Empty the chargingstations.
        $scope.chargingstations = {};

        //set usermarker
        NgMap.getMap().then(function(map) {
            if(position.lat() && position.lng()){
                $scope.usermarker = {
                    lat: position.lat(),
                    lng: position.lng(),
                    position: [position.lat(), position.lng()],
                    title: 'Min posisjon'
                };    
            } else if(position.latitude && position.longitude){
                 $scope.usermarker = {
                    lat: position.latitude,
                    lng: position.longitude,
                    position: [position.latitude, poistion.longitude],
                    title: 'Min posisjon'
                };   
            }
           
        });
                   
        MapService.getNearby(position.lat(), position.lng(), range); 
    }

    //When we recieve a chargingstation in "Get nearby" we eget geofire:KEY_ENTERED. 
    $scope.$on("GEOFIRE:KEY_ENTERED", function (event, data) {

        //Format the distance
        if(data.distance >= 1){
            data.distance = data.distance + "km" ;
        }else{
            data.distance = data.distance * 1000 
            data.distance = Math.floor(data.distance) + " meter";
        }
        
        $scope.chargingstations[data.key] = {
            lat: data.location[0],
            lng: data.location[1],
            position: [data.location[0], data.location[1]],
            key: data.key,
            distance: data.distance,
        }

    });

    $scope.getDirectionsToStation = function(toDestination){
        //get this from the info window which is currently open and "clicked". 
        $scope.toDestination = toDestination;
        
        //If no "from origin" has been defined, get pos from user position.
        //From origin is set if the user searches for a new destination from the menu. 
        if(!$scope.fromOrigin && $scope.position){
            $scope.fromOrigin = {lat: $scope.position.lat(), lng: $scope.position.lng()};
        }
        console.log("SET Destination. To destination:", toDestination);
        console.log("FROM origin", $scope.fromOrigin);
    }

    //For routes. 
    $scope.setDestination = function(toDestination){
        console.log("SET Destination", toDestination);
        $scope.toDestination = toDestination.formatted_address;
        console.log("Calculate route between fromOrigin and toDestination", $scope.fromOrigin, $scope.toDestination);
        NgMap.getMap().then(function(map) {

             $scope.$watch('map.directionsRenderers[0].directions', function(newValue, oldValue) {
                
                console.log(map);
                /* Calculate length and load charging stations along the route.
                */
                if(newValue){
                    var directions =  map.directionsRenderers[0].directions.routes[0];
                     //Get the path points
                    var pathPoints = directions.overview_path;

                    //Distance by car between both points. (In meters, so divide by 1000)
                    var travelDistance = directions.legs[0].distance.value / 1000;

                    // 5 km radius around each point. Gives 10 km in distance between each point. 
                    var distanceInterval = travelDistance / 10;


                    //divide this distanceInterval between all available points. 
                    var pointInterval = Math.floor(pathPoints.length/distanceInterval);
                    var range = 5; //Km

                    var counter = 0;
                    for (var i = 0; i < pathPoints.length; i+=pointInterval) {
                        //Empty the chargingstations and usermarker.
                        $scope.chargingstations = {};
                        $scope.usermarker = {};

                        MapService.getNearby(pathPoints[i].lat(), pathPoints[i].lng(), range);
                        counter ++;
                    }
                }
             });

        });  
    }
    //Bound to "topmenu" directive
    $scope.setOrigin = function(fromOrigin){
        console.log(fromOrigin);
        console.log('location', place.geometry.location);
        $scope.fromOrigin = fromOrigin.formatted_address;

        //If directions is enabled we dont want to get nearby.
        if(!$scope.directionsEnabled){
            centerAndGetNearby(place.geometry.location);
            $scope.position = place.geometry.location;
             MapService.setLastPos(place.geometry.location);
        } else{
            centerOnly(place.geometry.location);
        }
    }

    $scope.toggleDirections = function(){
        console.log($scope.directionsEnabled);
        if($scope.directionsEnabled){
            $scope.directionsEnabled = 0;
        } else{
            $scope.directionsEnabled = 1;
            //Add an additional search option in the topmenu. 
        }
    }

    //If GPS was turned on, simply switch it off.
    //If GPS was off, check if we can get position
    //If we cant get position either permissions is declined or gps is not turned on phone.
    //Show popup and ask user for permission.
    $scope.toggleGPS = function(){
        console.log($scope.GPSEnabled);
        if($scope.GPSEnabled){
            $scope.GPSEnabled = 0;
        } else{
            MapService.getMyPosLatLng().then(position => {
                $scope.GPSEnabled = 1;
                var userLatLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                $scope.position = userLatLng;
                 MapService.setLastPos(userLatLng);
                centerAndGetNearby(userLatLng);
            }, function(err){
                console.log("error turning on geolocation", err);
                 console.log("Need to ask for permission or ask user to turn on GPS.");
            }); 
        }
    }

    //Get marker from markerclick.
    $scope.showInfo = function(e, marker){
        //Get chargingstation info and populate infowindow. 
        //By doing it this way we don't need to download all charging stations at pageload.

        $scope.activeMarker = marker;
        $scope.map.showInfoWindow('cStation-info-window', "cStation-marker-"+marker.key);
        $scope.activeMarker.cStation = cStationService.getCStation(marker.key);
        
        //If we need Cpoint info:
        //$scope.nearbyLocations[data.key].cPoint = cStationService.getCPoint(data.key);

    }

    $scope.openStation = function(key){
        $state.go("station", {stationID: key});
    }


});
