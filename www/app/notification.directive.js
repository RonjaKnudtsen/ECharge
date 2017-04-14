/*****************************************
*        Notification directive          *
******************************************
	Template: app/notification.html
	Scope functions: 
		1. accept() - Accepts the notification. 
		2. dismiss() - Dismisses the notification.
	This directive waits data from the FCM notification Plugin.
	When it recieves a notification it will open a bootstrap modal $uibModal.open()
	
	Data recieved from the notification is saved in $scope.message
	$scope.message.type tells us what kind of notification this is. (checkin, checkout, achievement)
	$scope.message.reference tells us what charging station she/he is checking out/into or what 
	achievement the user has recieved. 

*/
var app = angular.module('shared.directives');

app.directive('notification', function(){
	return {
		controller: function($scope, $state, UserService, cStationService, NotificationServices, $uibModal) {
			$scope.message = {};
			var modalInstance = null;

			//FCM is only available when angular is ready. 
			angular.element(document).ready(function () {

				//FCMPlugin is not available from web. This if avoids errors.
				if(typeof FCMPlugin !== 'undefined'){

					FCMPlugin.onNotification(function(data){

						$scope.message = data;
						modalInstance = $uibModal.open({
					      animation: true,
					      templateUrl: 'app/notification.html',
					      scope: $scope,
					      size: 'md',
					    });		

					    console.log("scope.message",$scope.message);

					});
				}
			});

			$scope.accept = function(){
				//..
				var uid = UserService.getCurrentUID();	
				var reference = $scope.message.reference;
				console.log($scope.message.reference);
				console.log("scope.message",$scope.message);
				modalInstance.close();

			
				//Hvis personen stod sjekket in og nå vil flytte bilen sin.
				//Gi personen achievement. (Burde kanskje egentlig vente og se om han sjekker ut, ikke bare trykker ja).
				
				//Hvis personen stod i kø og nå vil sjekke inn (accept), sjekk inn hen inn.
				if($scope.message.type == 'queue'){
					//Go to station.
					$state.go("station.checkin", {stationID: reference});

					//Check user in
					var timestamp = new Date().toISOString();
					cStationService.checkIn(reference, uid, timestamp);

					//Increase stat/+Award achievement. 
					var stat = "checkedInCount";
					UserService.increaseUserStat(uid, stat, 1);
					

				}

				if($scope.message.type == 'checkOut'){
					console.log("type == checkOut. Accept.");
					//User responded to checkin request.
					//TODO: Should maybe add an additional step, first ask the user to
					//move her/his car, then ask again if he want to check out.
					
					$state.go("station.checkin", {stationID: reference});
					cStationService.checkOut(reference, uid);

					//Reward achievement/count. 
					var stat = "qRespondCount";
					UserService.increaseUserStat(uid, stat, 1);
				}

				if($scope.message.type == 'achievement'){
					console.log("Achievement!");

				}
			}

			$scope.dismiss = function(){
				
				//Person in queue dismissed: leave queue. 
				if($scope.message.type == 'queue'){
					cStationService.leaveQueue(reference, uid);
				}
				modalInstance.dismiss();
				//..$state.go("map");
				// Send han til ladestasjonen han er sjekket inn på.
			}

		},
		restrict: 'E',
		link: function(scope, elem, attrs, controller) {
			
			scope.$watch('message', function(newValue, oldValue) {
				console.log("watch:",scope.message);
				if(newValue){
					console.log("Watch: newValue",newValue, scope.message);
				}

            }, true);

			
		}
	};
});