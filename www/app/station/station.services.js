var app = angular.module('echarge.map');

app.service('cStationService', function ($cordovaGeolocation, NotificationServices, UserService, $firebaseObject, $firebaseArray, Database, MapService) {

	cStationService = this;

	//Get ONE chargingstation. 
	this.getCStation = function(id){
		return $firebaseObject(Database.cStationRef(id));
	}

	//Get name of charging station. Takes stationID
	this.getCStationName = function(stationID){
		return $firebaseObject(Database.cStationRef(stationID).child("name"));
	}
	//Get charging point, takes stationID
	this.getCPoint = function(id){
		return $firebaseObject(Database.cPointRef(id));
	}
	//Get checked in users, takes stationID
	this.getCheckins = function(stationID){
		return firebase.database().ref('stations/' + stationID + '/checkins');
	}
	//Get charging station queue. Takes stationID
	this.getQueue = function(stationID){
		return firebase.database().ref('stations/' + stationID + '/stationQueue');
	}
	//Get charging station comments. Takes stationID.
	this.getComments = function(stationID){
		return firebase.database().ref('stations/' + stationID + '/comments');
	}

	//TODO: updateComment, deleteComment

	/*this.updateComment = function(commentID, updateText){

	}

	this.likeComment = function(commentID, stationID){
	

	}*/

	this.leaveQueue = function(stationID, uid){
		console.log("Leave queue!");
		var qRef = Database.stationRef(stationID).child("stationQueue/"+uid);
		var stationQueue = $firebaseObject(qRef);
		stationQueue.$remove().then(function(ref){
			console.log("success", ref);
		}, function(error){
			console.log("error leaving "+uid+"from station queue in" + stationID);
			console.log(error);
			return false
		});

		//Todo: remove from user. 
	}

	//Save data both at user and at station. 
	this.checkIn = function(stationID, uid, timestamp){

		var checkinRef = Database.stationRef(stationID).child("checkins");
		var checkins = $firebaseObject(checkinRef);	
	
		checkins.$loaded(function(){
			checkins[uid] = timestamp;
			checkins.$save().then(function(ref){
				console.log("in queue",ref);
			}, function(error){
				console.log("error putting user in station queue", error);
			});
		});

		//TODO: Remove from queue IF in queue. Cant be IN queue and checked in at the same time. 
		

		//Add to user also
		var userInfo = $firebaseObject(Database.userInfoRef(uid));	
		userInfo.$loaded(function(){
			userInfo.checkedIn = {
				timestamp : timestamp,
	            station : stationID,
			};
			
			//Also append to usercheckin history? 

			userInfo.$save().then(function(ref){
				console.log(ref);
			}, function(error){
				console.log("error", error);
				return error;
			});
		});
		var stat = "checkedInCount";
		UserService.increaseUserStat(uid, stat, 1);
		
	}

	//Set user in queue, and notify people that are checked in about queue. 
	this.setInQ = function(stationID, uid, timestamp){
		//Save person in stations queue.
		var qRef = Database.stationRef(stationID).child("stationQueue");
		var qInfo = $firebaseObject(qRef);	
		
		qInfo.$loaded(function(){
			qInfo[uid] = timestamp;
			qInfo.$save().then(function(ref){
				console.log("in queue",ref);
			}, function(error){
				console.log("error putting user in station queue", error);
			});
		});
		
		//Save queue info to user. 
		var userInfoQueue = $firebaseObject(Database.userInfoRef(uid).child("stationQueue"));	
		userInfoQueue.stationQueue = {
			timestamp : timestamp,
            station : stationID,
		};
		userInfoQueue.$save().then(function(ref){
			console.log(ref);
		}, function(error){
			console.log("error", error);
			return error;
		});
		
		var stat = "qCount";
		UserService.increaseUserStat(uid, stat, 1);
		//TODO: Need to notify this user when the charging station is available.

		//Handle push notification.. 
		//Get person with longest time. 

		//Notify all users that there are people in queue. 


		var checkinRef = Database.stationRef(stationID).child("checkins");
		var checkins = $firebaseObject(checkinRef);	

		checkins.$loaded(function(){

			//value, key
			angular.forEach(checkins, function(timestamp, uid) {
				var data = generateMessage(timestamp, stationID);
				//Notify all users checked in. 
				var messageToken = UserService.getUserMessageToken(uid);
				messageToken.$loaded(function(value){
					NotificationServices.notify(messageToken.$value, data);
				});
			});

			console.log(checkins);
			
		});	
		

	}

	function generateMessage(timestamp, stationID){
		var data = {};
		//Generate message to be sent to users that are checked in. 
		//Calculate how long he has been charging. 
		var now = new Date();
		var then = new Date(timestamp);
		var diff = now - then;
		var minutes = diff / 60e3;

		//Math.floor()
		console.log("minutes before parsing",minutes);
		var hour = "";
		if(minutes > 60){
			hour = Math.floor(minutes / 60);
			minutes = Math.floor(minutes) % 60;

			hour = hour + " timer og ";
		} else {
			minutes = Math.floor(minutes);
		}
		var timeTotal = hour + minutes+" minutter";
		//Gives: 6 timer og 30 minutter
		//or simply: 40 minutter

		if(minutes > 120){
			//If less than 2 hours dont send notification.
		}


		data.reference = stationID; //To avoid circular stringify error. 
		data.body = "Du har ladet i " + timeTotal + ". Ønsker du å flytte bilen din?";
		data.title = "Det er kø på ladestasjonen";
		data.type = "checkOut";
		return data
	}


	this.checkOut = function(stationID, uid){

		var stationRef = Database.stationRef(stationID).child("checkins/"+uid);
		var list = $firebaseObject(stationRef);
		list.$remove().then(function(ref){
			console.log("success", ref);
		}, function(error){
			console.log("error checking out "+uid+"from station" + stationID);
			console.log(error);
			return false
		});
		var userRef = Database.userInfoRef(uid).child("checkedIn");
		var userInfo = $firebaseObject(userRef);

		userInfo.$remove().then(function(ref){
			console.log("checked_in_data_deleted / user checked out");
		}, function(error){
			console.log("error checking out user ", error);
			return false
		});	

		//If there was queue. Send notification to the latest person in queue that the charging station is now available.

		var qRef = Database.stationRef(stationID).child("stationQueue");
		var qInfo = $firebaseObject(qRef);	
		
		qInfo.$loaded(function(){
			//Compare timestamp. 
			var longestWaiting = 0;
			var firstInQueue = 0;
			angular.forEach(qInfo, function(timestamp, uid) {
				if(timestamp < longestWaiting || longestWaiting == 0){
					longestWaiting = timestamp;
					firstInQueue = uid;
					console.log(".. longest waiting:", timestamp, uid);
				}
			});
			console.log("first in queue", firstInQueue);
			//Get messagetoken from user.
			var messageToken =	UserService.getUserMessageToken(firstInQueue);
			messageToken.$loaded(function(value){
				var message = {};
				var stationName = cStationService.getCStationName(stationID);
				stationName.$loaded(function(value){
					console.log(value);
					console.log(stationName.value);
					message.title = "Det er ledig på: " + stationName.value;
					message.body = "Noen har sjekket ut og det er nå ledig på ladestasjonen. Ønsker du å sjekke inn?";
					message.reference = stationID;
					message.type = "queue";
					
					console.log("messageToken",messageToken.$value);
					NotificationServices.notify(messageToken.$value, message);
				});
				
			});
		});

	}
	this.addComment = function(comment){

		//Reference to comment path
		var commentref = "stations/" + comment.stationID + "/comments";

		//Generate a random key for the comment, used for editing etc. 
		var key = firebase.database().ref(commentref).push().key;

		//Set/push data. 
		return firebase.database().ref(commentref).child(key).set({
			date : comment.date,
            comment : comment.comment,
            user : comment.user,
            station : comment.stationID,
            likes : 0,
            key : key,
		});
	}

});