/*****************************************
*        Authentication service          *
******************************************
	1. isLoggedIn()
	2. watchStateChange()
	 
	This service is run on app start, before any views are displayed. 
	The service will redirect the user based on wheter or not she/he is logged in.
	If the user is logged in we will also setup FCM (firebase cloud messaging), so the user can recieve notifications. 

*/
var app = angular.module('echarge.authentication');

app.service('Authentication', function (Database, $q, $state, UserService, NotificationServices) {
	//Constants
	var loggedIn = false;

	this.isLoggedIn = function (){

		return loggedIn
	}


	this.watchStateChange = function(){
		//Redirects, based on login status. 
		Database.auth().onAuthStateChanged(function(user){
			if (!user) {
				loggedIn = false;
				$state.go('login');		
			} else {
				UserService.setCurrentUser();
				
				//Setup firebase cloud messaging token to user. 
				//Must do it here, after user is successfully logged in and registerred.
				NotificationServices.setupFCM();
				loggedIn = true;
				//console.log($state.current);
				if($state.current.url == 'login'){		
					
					$state.go('map');
				}
				//If state is abstract (no state)
				if($state.current.url == "^"){
					$state.go('map');
				}
			}
		});
	}
});
