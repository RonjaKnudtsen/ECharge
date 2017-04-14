/*
getUser(uid) 
getUsers() //Hent alle brukere. 

registerUser(username, passwd, email)
registerUserWFace(facebookcredentials, passwd)

loginUser()

deleteUser(userId)
updateUser(userId, object)
*/

var app = angular.module('echarge.user');

app.service('UserService', function (Firebase, $firebaseAuth, $firebaseArray, Database, $firebaseObject) {
	var userRef = $firebaseArray(Database.userInfoRef());
	var userService = this;

	//If no user is logged in we cant set currentuser.
	if(firebase.auth().currentUser){
		userService.setCurrentUser();
	}

	this.setCurrentUser = function(){
		userService.currentUser = firebase.auth().currentUser;
		userService.currentUID = this.currentUser.uid;
		userService.currentUserInfo = $firebaseObject(Database.userInfoRef(this.currentUID));
		userService.currentUsername = this.currentUserInfo.username;
		userService.currentUserStatistics = $firebaseObject(Database.userStatisticsRef(this.currentUID));
	}

		
	
	//These get functions can be removed, and this.currentUID can be used instead.
	this.getCurrentUID = function(){
		var user = firebase.auth().currentUser;
		return user.uid;
	}
	this.getCurrentUser = function(){
		var user = firebase.auth().currentUser;
		return user;
	}
	this.getCurrentUsername = function(){
		var user = $firebaseObject(Database.userInfoRef(this.currentUID));
		return user.username;
	}
	this.getUserInfo = function(uid){
		if(uid){
			return $firebaseObject(Database.userInfoRef(uid));
		} else{
			var currentUID = UserService.getCurrentUID();
			return $firebaseObject(Database.userInfoRef(currentUID));
		}
	}
	//Used to send notifications to user. 
	this.getUserMessageToken = function(uid){
		var messageToken = $firebaseObject(Database.userInfoRef(uid).child("messageToken"));	
		console.log("messageToken", messageToken);
		return messageToken
	}

	/* Reward users with points.
	 * If no UID is given, use currently signed in user. */
	this.rewardPoints = function(uid, value){
		if(!uid){
			var uid = UserService.uid;
		}
		if(value<2){
			console.log("Error: value must be larger than 1");
			return false;
		} else{
			var userInfo = $firebaseObject(Database.userInfoRef(uid));		
			userInfo.$loaded().then(function(data) {
				//I.e, increase user points by 50;
				userInfo.points += value;
				userInfo.$save().then(function(ref){
					console.log("success updating points", ref);
					return true;
				},function(error){
					console.log("Error giving points", error);
					return false;
				});
			}, function(error){
				console.log("Error getting user info", error);
				return false;
			});
		}


	}

	/* Uid: User id
	 * Stat can be one of: checkedInCount, commentsCount, friendCount, highestCommentRate, qCount, qRespondCount
	 * Value: Number of values to increase. */
	this.increaseUserStat = function(uid, stat, value){
		if(!value){
			var value = 1;
		}
		if(!uid){
			var uid = UserService.uid;
		}
		var validStat = [
			"checkedInCount",
			"commentsCount",
			"friendCount",
			"highestCommentRate",
			"qCount",
			"qRespondCount"
		];
		
		if(validStat.indexOf(stat) !== -1){

			var userStatistics = $firebaseObject(Database.userStatisticsRef(uid));

			userStatistics.$loaded().then(function(data) {
				//I.e, increase userStatistics[commentsCount] by 1;
				userStatistics[stat] += value;

				userStatistics.$save().then(function(ref){
					console.log("Success updating statistics: ",userStatistics);
					return true;
				}, function(error){
					console.log("Error updating user statistics", error);
					return false;
				});

			}, function(error){
				console.log("Error getting user statistics", error);
				return false;
			});

		} else{
			console.log("Stat that is to be updated is not valid.");
			return "Stat that is to be updated is not valid"
		}

		//Check for achievement for given stat.

		//If awarding achievment -> give badge and send notification


	}

/*/*
	this.checkAchievement(uid, stat){

		TODO:::
			each statistics have one or more achievements connected to it. 
			each achievement have one or more levels
			each achievement level requires the user to have 
			one or more statistics with a value higher than the required value.

			Eg. Checkin-10 requires that the user have checked in 10 times. 

			users have 0 or more achievements in any level. 

			1. first check what achievements are connected to this statistics.
				- This should be a table in the statistics table. 
			2. Check what level the user have in given achievements.
				check users - achievement - achievementValue 
			3. Then check what are the requirements for the next level of achievement.
				check => achievments/level-requirement/(next-level)
			4. then compare achievements with UsersStatistics and see if next level is available. 
				get userstatistics and compare. 
			5. award achievement or not. (send notification, increase level for user)

			example of table:

			achievments{
				checkIn{
					statistics: checkedInCount,
					name: "På sjekkern",
					description: "Å sjekke inn er det første steget før vi sjekker ut."
					max-level: 5
					level-requirements{
						1 : {
							checkedInCount: 1
						}
						2 : {
							checkedInCount: 10
						}
						3 : {
							checkedInCount: 50
						}
						4 : {
							checkedInCount: 100
						}
					}
				}
				getStarted{
					statistics: checkin, checkout, respond, comment, profilepic,
					max-level: 1,
					name: "Første steg"
					description: "Du er fortsatt en baby, prøv å "
					level-requirements{
						1:{
							checkin - 1,
							checkout - 1,
							respond - 1,
							comment - 1,
							profilepic - 1,
						}
					}
				}
			}

			user table example:
			ronjark{
				achievements{
					getStarted - 0,
					checkin - 2,
				}
			}

			this means ronjark have achievement checkin level 2 and no level in getStarted. 

		
	}
*/

	this.loginUser = function(credentials){
		var email = credentials.email.input;
		var password = credentials.password.input; 

		//TODO: make promise that handles differeent errors. 

		return Firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
		  // Handle Errors here.
		  console.log("ERROR SIGNING IN" + error.code + error.message);		  
		});
	}

	this.logout = function(){
		Firebase.auth().signOut().then(function() {
		  console.log("Signed out");
		}, function(error) {
			console.log("error signing out: ");
		 	console.log(error);
		});
	}
	//Updates bulks of statistics. 
	this.updateStatistics = function(uid, data){

	}
	this.registerUser = function(credentials){
		var email = credentials.email.input;
		var password = credentials.password.input; 
		var repeatpassword = credentials.repeatpassword.input;
		var username = credentials.username.input;
		//TODO: add userimage when registering

		//TODO: make promise that handles differeent errors. 
		//Different error handling. 
		//TODO: Check if username is already in use
		if(password != repeatpassword){
			return "Passwords are not same"
		} else if(email < 5 || password < 5 || username < 3){
			console.log("Missing required data");
			console.log("email: "+email);
			console.log("password: "+password);
			return("Missing data or to short password/email/username");
		} else {

			$firebaseAuth().$createUserWithEmailAndPassword(email, password)
			.then(function(firebaseUser) {
				console.log("User " + firebaseUser.uid + " created successfully!");

				//Add extra userinfo in database:
				var user = $firebaseObject(Database.userInfoRef(firebaseUser.uid));

				user.uid = firebaseUser.uid,
				user.username = username;
				user.points = 0;
				user.rank = 1;
				

				user.$save().then(function(ref){
					var statistics = $firebaseObject(Database.userStatisticsRef(firebaseUser.uid));
					
					statistics.commentsCount = 0;
					statistics.checkedInCount = 0;
					statistics.qCount = 0;
					statistics.qRespondCount = 0;
					statistics.highestCommentRate = 0;
					statistics.memberSince = new Date().toISOString();
					statistics.friendCount = 0;
					statistics.lastCheckin = 0;

					statistics.$save().then(function(ref){
						console.log("Success", ref);
						return firebaseUser
					}, function(error){
						console.log("Error registering extra userinfo", error);
						return error
					});

				}, function(error){
					console.log("Error registering extra userinfo", error);
					return error
				});

			


				
			}).catch(function(error) {
				console.error("Error: ", error);
				//Show error message. 
				return error
			});

		}

		
	}

});




