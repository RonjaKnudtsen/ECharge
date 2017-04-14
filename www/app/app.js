//Initalize modules. (so the can be controllers loaded before we can set up route).

//Setup echarge notifications
angular.module('echarge.notification', ['ngCordova']);

//Echarge achievements.
angular.module('echarge.achievements', []);

//Setup directives that can later be used in state views.
angular.module('shared.directives', ['ngAnimate', 'ui.bootstrap']);

//Contains database service. This initializes the connection to the server. 
angular.module('echarge.database', ['firebase']); 

//Handles authentication, login,logout and register. 
angular.module('echarge.authentication', ['firebase', 'echarge.database', 'echarge.notification']);

//Handles map and charging stations
angular.module('echarge.map', ['ngMap', 'ngCordova', 'ngAnimate', 'echarge.authentication', 'echarge.database', 'shared.directives']);

//Handles users. 
angular.module('echarge.user', ['echarge.authentication', 'echarge.database', 'shared.directives']);

//Sew it all together
var app = angular.module('echarge', ['echarge.database', 'shared.directives', 'echarge.notification', 'echarge.achievements', 'ngCordova', 'ui.router', 'echarge.map', 'echarge.user', 'echarge.authentication', 'ui.bootstrap']);

//app.run Is runned before config
app.run(function(Authentication, NotificationServices, $rootScope, $state, $cordovaPushV5){
	
  //Will watch user stats, login and authentication
  Authentication.watchStateChange();

  //Setup firebase cloud messaging (push notifications)
  NotificationServices.setupFCM();
  
});

//Config, run before any service or controller
app.config(function($stateProvider, $urlRouterProvider){
  $stateProvider
  .state('profile',{
    url: "profile/:userID",
    templateUrl: "app/user/profile.html",
    controller: "profile-controller",
  })
  .state('profile.badges',{
    url: "/badges",
    templateUrl: "app/user/badges.html",
    controller: "profile-controller",
  })
  .state('profile.friends',{
    url: "/friends",
    templateUrl: "app/user/friends.html",
    controller: "profile-controller",
  })
 .state('login',{
  	url: "login",
  	templateUrl: "app/user/user-login.html",
  	controller: "login-controller",
  })
  .state('register', {
  	url: "register",
  	templateUrl: "app/user/user-register.html",
  	controller: "login-controller",
  })
  .state('settings', {
    url: "settings",
    templateUrl: "app/user/settings.html",
    controller: 'settings-controller',
  })
  .state('map',{
    url: "map",
    templateUrl: "app/map/map.html",
    controller: "map-controller",
  })
  .state('station',{
    url: "station/:stationID",
    templateUrl: "app/station/station.html",
     controller: "station-controller",
  })
  .state('station.checkin',{
    url: "/checkin",
    templateUrl: "app/station/checkin.html",
    controller: "checkin-controller",
  })
  .state('station.comments',{
    url: "/comments",
    templateUrl: "app/station/comments.html",
    controller: "comment-controller",
  })
  $urlRouterProvider
  .otherwise('/login')
 // .when('/', '/app/login');
});

app.controller(function(){
	console.log("Main controller loaded.");

});