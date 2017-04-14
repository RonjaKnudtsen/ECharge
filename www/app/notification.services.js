var app = angular.module('echarge.notification');

app.service('NotificationServices', function($http, UserService, $firebaseObject, Database, $filter){

	//Firebase cloud messaging.
	//Tutorial: https://github.com/mexists/ionic-fcm-starter/blob/master/TUTORIAL.md 
	//This is executed on app run. 

	//TODO: hide key 
	var key = "AAAAzXt_1VI:APA91bFMlWHmGV0R_qy0yZJsNqH7FdgRyY9KFpD_8VbF4YW1gXbmeIG7dKzNJQIhIL9rxRoOysBjRvSoCEF0ST5kDszQxJtDtWF2KM0XF9B-neRcX6LrVE-6hJvcq6EwD9XBsDvRZUb8";
	
	//Takes token and data.
	this.notify = function(userToken, data){

		if(!data.stationID){
			data.stationID = 0;
		}


		$http({
	      method: "POST",
	      dataType: 'jsonp',
	      headers: {'Content-Type': 'application/json', 'Authorization': 'key='+key},
	      url: "https://fcm.googleapis.com/fcm/send",
	      data: JSON.stringify(
	          {
	            "notification":{
	              "title": data.title,  //Any value
	              "body": data.body,  //Any value
	              "sound": "default", //If you want notification sound
	              "click_action": "FCM_PLUGIN_ACTIVITY",  //Must be present for Android
	              "icon": "fcm_push_icon"  //White icon Android resource
	            },
	            "data" : {
	            	"title" : data.title,
	            	"body" : data.body,
	            	"reference" : data.reference,
	            	"type" : data.type
	            },
	            "to": userToken, //Topic or single device
	            "priority":"high", //If not set, notification won't be delivered on completely closed iOS app
	            "restricted_package_name":"" //Optional. Set for application filtering
	          }
	        )
	    });

	}


	this.setupFCM = function(){
		console.log("Notification SERVICES INITIATED");
		//If user is not registered yet, we cant save token to user in database.
		if(UserService.currentUID){
			console.log("Uploading token");
			//Wait for angular to be ready. 
			angular.element(document).ready(function () {

				//FCM plugin is not available in browser, only on compiled mobile devices. 
				//Avvoid errors in browser:
				if(typeof FCMPlugin !== 'undefined'){
					FCMPlugin.getToken(
					//Save token to user. 
					  function (token) {
					    
					    console.log('Token: ' + token);
					    //Save token in userinfo so we can send messages to this user from another. 
					    var uid = UserService.currentUID; 
					    var userInfo = $firebaseObject(Database.userInfoRef(uid));		

						userInfo.$loaded().then(function() {
							userInfo.messageToken = token;
							userInfo.$save().then(function(){
								console.log("new token updated",userInfo);

							});
						});
						

					  },
					  function (err) {
					      //alert('error retrieving token: ' + token);
					      console.log('error retrieving token: ' + err);
					  }
					);

					
				}
				

		    });
		}

		

	}

   
    
});
