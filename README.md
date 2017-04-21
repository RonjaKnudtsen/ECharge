# ECharge - Sharing is caring
There are many libraries that needs to be installed, but the main part of the apps logic which is written by us is put inside the “www/app/” folder. The cronjob and index file however, is located in the www folder. 

#### Components in the app
The different components in the app have a dedicated folder, such as “user”, or “map”. The business logic is saved in the *-controller and *-services files, and the templates or view is saved in the *-template files. Some directives and services are shared and are not put in any specific folder. The index.html loads the app.js file which bootstraps the app by setting up dependencies and the routeprovider.

## Requirements
- In order to install the required dependencies to build the application you need cordova and bower.
- In order to install bower and cordova you need node, npm and git.

### Bower 
Bower is used to install javascript libraries. 
- Install bower with "npm install bower "
- Install bower dependencies by running bower install from the www folder.

### Cordova
Cordova is used to compile the WWW folder into an Android or IOS application
- Build the app by running cordova build android
- Test the application by running cordova run
- To test on a mobile phone, enable debugging mode from the phones settings, connect an usb to the computer, press “allow” on any permission promt and type “cordova run”. Sometimes you also need to select the device from the terminal. 

## Using the application
You need to register a user with password and email in order to test the app. 
You are free to modify the app and suggest any improvements by sending a pull request to this repo. 




