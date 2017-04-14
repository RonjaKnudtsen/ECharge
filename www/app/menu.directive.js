var app = angular.module('shared.directives');

app.directive('topMenu', function(){
	return {
		scope: {
			// =: Shared variable, &: shared functions, @:one way string. 
			setDestination: '&',
			toDestination: '=',
			setOrigin: '&',
			fromOrigin: '=',
			directionsEnabled: '=',
			tabs: '=',

			type : '@', //Map, substate, state
			name: '@', //If a name is to be presented in the menu.
			themecolor: '@', //Green, orange, purple, white.
		}, // {} = isolate, true = child, false/undefined = no change
		controller: function($scope, $element, $attrs, $transclude, $state, UserService) {
			$scope.uid = UserService.getCurrentUID();
			$scope.types = ['address'];
			//If we toggle naviagtion we need to change the placeholder. 
			$scope.standardPlaceholder = "Sted, by, adresse..";
			$scope.fromPlaceholder = "Jeg vil reise fra.."
			$scope.inputfieldPlaceholder = $scope.standardPlaceholder;

			//When place is changed in searchbar. Execute parentcontrollers search.
			//Pass place as searchword. 
			//Couldnt do this.getplace from parentcontroller, so we need to take a detour.
			$scope.fromPlaceChanged = function() {
				place = this.getPlace();
				$scope.setOrigin({fromOrigin : place});
				console.log("directionsEnabled", $scope.directionsEnabled);
			}

			$scope.toPlaceChanged = function(){
				place = this.getPlace();
				console.log("toPlaceChanged:",place);
				console.log("toDestination", $scope.toDestination);
				console.log("searchword", $scope.searchword);
				$scope.setDestination({toDestination : place});
			}

			//Faicon = font awesome icon
			$scope.openmenu = false;
			$scope.menu = [
				{ name: 'map', faicon: 'fa-globe', heading: "Kart", route: "map", active: true },
				{ name: 'profile', faicon: 'fa-user', heading: "Min profil", route: "profile({userID: '"+$scope.uid+"'})", active: false },
				//{ name: 'notification', faicon: 'fa-comment', heading: "Varsler", route: "", active: false },
			];

			$scope.submenu = [
				{ name: 'settings', faicon: 'fa-cog', heading: "Instillinger", route: "settings", active: false },
			]

			var state= $state.current;
			$scope.menuItems

			
			
			$scope.changeTab = function(newTabState){
				if($scope.tabs){
					//Set the previously active tab as not active and set the newTabState to active
					angular.forEach($scope.tabs, function(tab, key){
						if(tab.active == true){
							tab.active = false;
						}
						if(tab.name == newTabState){
							tab.active = true;
						}
					});
				}
			}

			$scope.openthismenu = function(){
			  $scope.openmenu = true;
			  console.log("Trying to open menu", $scope.openmenu);
			}

			$scope.closemenu = function(){
			  $scope.openmenu = false;
			  console.log("Trying to close menu", $scope.openmenu);
			}

			$scope.closeState = function() {
				//Unless other substates also need a close button. 
				//We could also make a back button and save the previous state in onstatechange
				$state.go("map");
			}

			//Rootscope on rootstatesuccess. 
		},
		restrict: 'E',
		templateUrl: 'app/topmenu.html',
		link: function(scope, elem, attrs, controller) {

			scope.$watch('directionsEnabled', function(newValue, oldValue) {
                if (newValue==1){
                	console.log("Directions are enabled");
                	scope.inputfieldPlaceholder = scope.fromPlaceholder;                	
                } else if(newValue ==0){
                	console.log("Directions are disabled", scope.standardPlaceholder);
                	scope.inputfieldPlaceholder = scope.standardPlaceholder;
                }
            }, true);

			
		}
	};
});