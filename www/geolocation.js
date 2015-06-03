/*
Copyright 2015 Intel Corporation

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file 
except in compliance with the License. You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the 
License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, 
either express or implied. See the License for the specific language governing permissions 
and limitations under the License
*/

var exec = require('cordova/exec'),
	Coords = require('./coords'),
	Position = require('./position');

		/**
		 * This class contains acceleration information
		 * @constructor
		 * @param {Number} x The force applied by the device in the x-axis.
		 * @param {Number} y The force applied by the device in the y-axis.
		 * @param {Number} z The force applied by the device in the z-axis.
		 * @param {boolean} doRotate If true, rotate axes based on device rotation.
		 */

	module.exports = {
		watchIDs: new Array(),
		successCBs: new Array(),
		errorCBs: new Array(),
		pollID: -1,

		getCurrentPosition: function(successCallback, errorCallback, options) {
			if( (successCallback == undefined || successCallback==''))
			{
				throw(new Error("Error: getCurrentPosition has the following required parameters: successCallback."));
			}

			var successID = this.getSuccessId(successCallback);
			var errorID = errorCallback == undefined ? -1 : this.getErrorId(errorCallback);
			var enableHighAccuracy = true;
			var maximumAge = -1;
			
			if (options != undefined) {
				if (options.maximumAge != undefined)
					maximumAge = options.maximumAge;
				if (options.enableHighAccuracy != undefined)
					enableHighAccuracy = options.enableHighAccuracy;
			}
			
			//AppMobiGeolocation.printMessage("getCurrentPosition: " + id + ", pollID = " + this.pollID);
			//var id = AppMobiGeolocation.getCurrentPosition(successID, errorID, maximumAge, enableHighAccuracy);
			exec(function(id) {
				intel.xdk.geolocation.watchIDs.push(id);
			}, null, "IntelXDKGeolocation", "getCurrentPosition", [successID, errorID, maximumAge, enableHighAccuracy]);
			
			if (this.pollID == -1) {
				this.pollID = setInterval("intel.xdk.geolocation.poll()", 200);	// Poll every 200 msecs.
			}
		},
	
		poll: function() {
			var i, to = 0, len = this.watchIDs.length;

			for (i = 0; i < len; ++i) {
				exec(function(loc) {
					if (loc != "") {	
						loc = new String(loc);	// Convert to actual string.
						var vals = loc.split(",");
						var once = vals[0];
						intel.xdk.geolocation.successCB(vals[1],vals[2],vals[3],vals[4],vals[5],vals[6],vals[7],vals[8], vals[9]);
						if (once == 0)
							intel.xdk.geolocation.watchIDs[to++] = intel.xdk.geolocation.watchIDs[i];
						else if (once == 1)
							intel.xdk.geolocation.clearWatch(intel.xdk.geolocation.watchIDs[i]);
						
					} else
						intel.xdk.geolocation.watchIDs[to++] = intel.xdk.geolocation.watchIDs[i];				

				}, null, "IntelXDKGeolocation", "pollLocation", [this.watchIDs[i]]);
			}

			//if (to < len)
			//	this.watchIDs.splice(to);
		},
			
		getSuccessId: function(successCallback) {
			var i, len = this.successCBs.length;
			for (i = 0; i < len; ++i) {
				if (this.successCBs[i] == successCallback)
					return i;
			}
			len = this.successCBs.push(successCallback);
			return len - 1;
		},
			
		getErrorId: function(errorCallback) {
			var i, len = this.errorCBs.length;
			for (i = 0; i < len; ++i) {
				if (this.errorCBs[i] == errorCallback)
					return i;
			}
			len = this.errorCBs.push(errorCallback);
			return len - 1;
		},
		
		successCB: function(ID, latitude, longitude, altitude, accuracy, altitudeAccuracy, heading, speed, timestamp) {
			var fun = this.successCBs[ID];
			var coords = new intel.xdk.coords.Coords(latitude, longitude, altitude, accuracy, altitudeAccuracy, heading, speed);
			var p = new intel.xdk.position.Position(coords, timestamp);
			fun(p);
		},
		
		errorCB: function(ID) {
			var fun = this.errorCBs[ID];
			fun();
		},
		
		watchPosition: function(successCallback, errorCallback, options) {
			if( (successCallback == undefined || successCallback==''))
			{
				throw(new Error("Error: watchPosition has the following required parameters: successCallback."));
			}
			
			var successID = this.getSuccessId(successCallback);
			var errorID = errorCallback == undefined ? -1 : this.getErrorId(errorCallback);
			var freq = 10000;
			var enableHighAccuracy = true;
			var maximumAge = -1;
			var returnId;

			if (options != undefined) {
				if (options.timeout != undefined)
					freq = options.timeout;
				if (options.maximumAge != undefined)
					maximumAge = options.maximumAge;
				if (options.enableHighAccuracy != undefined)
				enableHighAccuracy = options.enableHighAccuracy;
			}
			
			//var id = AppMobiGeolocation.watchPosition(successID, errorID, freq, maximumAge, enableHighAccuracy);
			
			exec(function(id) {
				intel.xdk.geolocation.watchIDs.push(id);
				returnId = id;
			}, null, "IntelXDKGeolocation", "watchPosition", [successID, errorID, freq, maximumAge, enableHighAccuracy]);

			//AppMobiGeolocation.printMessage("watchPosition: " + id + ", pollID = " + this.pollID);
			//this.watchIDs.push(id);
			if (this.pollID == -1) {
				//AppMobiGeolocation.printMessage("About to schedule poll()");
				this.pollID = setInterval("intel.xdk.geolocation.poll()", 200);	// Poll every 200 msecs.
			}
			return returnId;
		},
			
		clearWatch: function(id) {
			//AppMobiGeolocation.clearWatch(id);

				exec(function(id) {
					var index = intel.xdk.geolocation.watchIDs.indexOf(id);
					if (index != -1) {
						intel.xdk.geolocation.watchIDs.splice(index, 1);
						if (intel.xdk.geolocation.watchIDs.length == 0 && id != -1) {
							clearInterval(id);
							intel.xdk.geolocation.pollID = -1;
						}
					}
				}, null, "IntelXDKGeolocation", "clearWatch", [id]);
		}
}