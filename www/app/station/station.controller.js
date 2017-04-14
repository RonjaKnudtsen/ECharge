/*****************************************
*        Station controller              *
******************************************
    Three different controllers.
    1. checkin controller
    Handles checkin/checkout, checks wheter or not the user is checked in/in queue.
    opens a stream where we wait for a snapshot. The snapshot is then populating the view.

    2. comment controller
    Handles comments, let user publish comment and read them.

    3. station controller
    Gets general information about the charging station and its charging points. 
    Also generates charging station tabs that is shared with the menu directive. 

*/

var app = angular.module('echarge.map');
app.controller('checkin-controller', function($scope, $state, $stateParams, cStationService, UserService){
    
    var stationID = $state.params.stationID;
    var uid = UserService.currentUID;

    $scope.station = cStationService.getCStation(stationID);
    $scope.name = null;
    
    $scope.stationCheckins = null; //Contains information about which user and their time spent checked in there. 
    $scope.stationQueue = null;

    $scope.checkedIn = 0;
    $scope.inQueue = 0;

    $scope.userIsCheckedIn = null;
    $scope.userIsInQueue = null;

    $scope.distance = 0; //TODO: Get distance from user to station. Can't checkin from everywhere!!

    var checkinStream = cStationService.getCheckins(stationID);
    var qStream = cStationService.getQueue(stationID);

    //Takes in snapshot value when we recieve checkins. 
    checkinStream.on('value', function(snapshot) {
        $scope.stationCheckins = snapshot.val();
        $scope.checkedIn = 0;  //We need to count from start in each snapshot. 
        $scope.userIsCheckedIn = false;

        angular.forEach($scope.stationCheckins, function(data, key){

            //se if this user is checked in. 
            if(key == UserService.currentUID){
                $scope.userIsCheckedIn = true; 
            }
            $scope.checkedIn ++;
        });
        $scope.$digest();
    });

    //Takes in snapshot value when we recieve people in queue.
    qStream.on('value', function(snapshot) {
        $scope.stationQueue = snapshot.val();
        $scope.inQueue = 0;  //We need to count from start in each snapshot. 
        $scope.userIsInQueue = false;

        angular.forEach($scope.stationQueue, function(data, key){

            //se if this user is in queue.
            if(key == UserService.currentUID){
                $scope.userIsInQueue = true; 
                //TODO: Need to notify this user when the charging station is available.
            }
            $scope.inQueue ++;
        });
        $scope.$digest();
    });

     //Charging station is loaded, get info.
     $scope.cStation.$loaded().then(function(info){
        //Hent ut antall ladepunkter
        $scope.max_checkin = info.Available_charging_points.value;
        $scope.name = info.name.value;
     });


    $scope.leaveQ = function(){
        console.log("Leave queue!");
        cStationService.leaveQueue(stationID, uid);
    }

    $scope.checkInUser = function(){
        var cTimestamp = new Date().toISOString();
        cStationService.checkIn(stationID, uid, cTimestamp);
     }

     $scope.checkOutUser = function(){  
        cStationService.checkOut(stationID, uid);
     }

     $scope.setUserInQ = function(){
        var qTimestamp = new Date().toISOString();
        cStationService.setInQ(stationID, uid, qTimestamp);
     }

     $scope.leaveQueue = function(){
        //When user goes from queue to checkin we have successfully convinced someone to checkout ? 
        //Todo, remove from queue. 
     }

});

app.controller('comment-controller', function($scope, $state, $stateParams, cStationService, UserService){
    var stationID = $state.params.stationID;
    $scope.newComment = {};
    $scope.newComment.comment = "";
    $scope.comments = {};
    $scope.commentState = true;
    $scope.commentEmpty = true;
    var commentStream = cStationService.getComments(stationID);

    //Takes in snapshot value when we get new comments. 
    commentStream.on('value', function(snapshot) {

            $scope.comments = snapshot.val();
            if(snapshot.val() == null){
                //No comments on this station
                $scope.commentEmpty = true;
            } else{
                $scope.commentEmpty = false;
            }
           
            angular.forEach($scope.comments, function(comment, key){
                console.log("comment",comment);
                var commentUID = comment.user;
                comment.userInfo = UserService.getUserInfo(commentUID);
                console.log(comment);
            });
           
    });


    //toggles commentState off and on.
     $scope.toggle_comment = function(){
        $scope.commentState = !$scope.commentState;
    }

     //takes a newComment and submits it to server
     //Sets user to currently logged in user
     //Sets date to current date. 
    $scope.add_comment = function(newComment){
        var date = new Date().toISOString();

        //TODO: Check that comment exists and has > 5 in length. 
        //TODO: Check that we can get date. 
        var comment = {
            date : date,
            comment : newComment.comment,
            user : UserService.currentUID,
            stationID : stationID,
        };
        
        cStationService.addComment(comment).then(function(){
            UserService.increaseUserStat(UserService.currentUID, "commentsCount", 1);
            UserService.rewardPoints(UserService.currentUID, 10);
        }).catch(function (error){
            console.log("error", error);
        });

        
        //TODO: Increaase commentCount stat
        //TODO: THEN: Check for achievement! 

        //Changes commentstate since a comment have been added, unless error. 
        $scope.commentState = !$scope.commentState;
        //TODO: Notification that comment have been added +/ warning if error. 

    }

});
app.controller('station-controller', function($scope, $state, $stateParams, cStationService, UserService){
    var stationID = $state.params.stationID;
    $scope.cStation = cStationService.getCStation(stationID);
    $scope.cPoint = cStationService.getCPoint(stationID);
    $scope.iconlist = {};

    //Station tabs
    $scope.tabs = [
        { name: 'station', heading: "Ladestasjon", route : "station({stationID: '" + stationID + "'})", active: true },
        { name: 'comments', heading: "Kommentarer", route : "station.comments({stationID: '" + stationID + "'})", active: false },
        { name: 'checkin', heading: "Innsjekking", route : "station.checkin({stationID: '" + stationID + "'})", active: false },
    ];

    //When charging point is loaded, add info to iconlist
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

         //TODO: append this to accessibility
         //$scope.iconlist.accessibility["payment_method"] = info["paymentmethod"], 
    });

    //When charging station is loaded, add info to gridInfo.
    $scope.cStation.$loaded().then(function(info){

        $scope.gridInfo = {
            open24 : info["Open 24h"],
            realtime : info["Real-time information"],
            timeLimit: info["Time limit"],
            availability: info["Availability"],
            location: info["Location"],
            owned_by: info["Owned_by"],
        };
        console.log("GRIDINFO:",$scope.gridInfo);
    });

   

});