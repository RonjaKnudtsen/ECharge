var app = angular.module('echarge.user');

app.controller('profile-controller', function($scope, $state, UserService){
   var uid = $state.params.userID;

   $scope.user = UserService.getUserInfo(uid);

   $scope.tabs = [
       { name: 'profile', heading: "Profil", route: "profile({userID: '" + uid + "' })", active: true },
       { name: 'badges', heading: "Emblemer", route: "profile.badges({userID: '" + uid + "'})", active: false },
       { name: 'friends', heading: "Venner", route: "profile.friends({userID: '" + uid + "'})", active: false },
       
    ];
/*
   //$scope.user = UserService.getUserInfo();
   $scope.user = {
      name: "Ronja Knudtsen",
      points: 10000,
      rank: "Miljøvennlig",
      image: "hest.jpg"
   }*/

  

});

app.controller('settings-controller', function($scope, $state, UserService){
   console.log("Settings..");
   $scope.logout = function(){
         console.log("Login out");
         UserService.logout();
   }
   //other settings

});


app.controller('login-controller', function($scope, $state, UserService){
      //Variablenames for register and login form.
      //Keep them here so we easily can change them.
      $scope.credentials = {};
      $scope.registerInfo = {};

      $scope.credentials.email = {
         input : "",
         inputype : "text",
         placeholder : "Din e-postadresse",
      };
      $scope.credentials.password = {
         input : "",
         inputype : "password",
         placeholder : "Ditt passord",
      };

      $scope.registerInfo.email = {
         input : "",
         inputype : "text",
         placeholder : "Din e-postadresse",
      };
      $scope.registerInfo.username = {
         input : "",
         inputype : "text",
         placeholder : "Ønsket brukernavn",
      };
      $scope.registerInfo.password = {
         input : "",
         inputype : "password",
         placeholder : "Ønsket passord",         
      };
      $scope.registerInfo.repeatpassword = {
         input : "",
         inputype : "password",
         placeholder : "Gjenta passord",         
      };

      //Switch between states. 
      //They share controllers, but have different templates. 

      $scope.goRegister = function(){
         $state.go("register");        
      }
      $scope.goLogin = function(){
         console.log("GO LOGIN");
         $state.go("login");    

      }
   	
   	$scope.login = function(credentials){
   		console.log(credentials);
         console.log(credentials.email);
         console.log(credentials.password);
         UserService.loginUser(credentials);
         //Do firebase stuff.
         //Save authentication etc...   
   	}
      $scope.register = function(registerInfo){
         console.log(registerInfo);
         var registered = UserService.registerUser(registerInfo);
         
    //     console.log(registerInfo.email);
     //    console.log(registerInfo.password);
         //Do firebase stuff.
         //Save authentication etc... 
         
      }     
   	
   	$scope.forgottenPassword = function(){
   		console.log("forgottenPassword");

   	}


});


app.controller('register-controller', function($scope){
   console.log("Start registering process");
});