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


    var successCallbackID = 1,
    errorCallbackID = 1,
    maximumAge = 10,
    highAccuracy = true,
    watchId = null,
    polling = false,
    listeners = new Array();

    cordova.commandProxy.add("IntelXDKGeolocation", {
    /*successCallbackID: 1,
    errorCallbackID: 1,
    maximumAge: 10,
    highAccuracy: true,
    watchId:null,
    listeners: new Array(),*/

    getCurrentPosition: function(successCallback, errorCallback, params) {
        //alert('hi ryan');
        successCallbackID = params[0];
        errorCallbackID = params[1];
        maximumAge = params[2];
        highAccuracy = params[3];

        //getPosition(maximumAge, highAccuracy)
        var geolocator = Windows.Devices.Geolocation.Geolocator();

        geolocator.desiredAccuracy = Windows.Devices.Geolocation.PositionAccuracy.high;

        //successCallback(watchId);

        // Get the geoposition, capturing the request in a 'promise' object.
        var promise = geolocator.getGeopositionAsync();
        promise.done(
            function (pos) {
                // Get the coordinates of the current location.
                var coord = pos.coordinate;

                //System.Globalization.CultureInfo ci = new CultureInfo("en-US");

                var lat = (coord.latitude != null) ? coord.latitude : "0.00";
                var lng = (coord.longitude != null) ? coord.longitude : "0.00";
                var alt = (coord.altitude != null) ? coord.altitude : "0.00";
                var acc = (coord.accuracy != null) ? coord.accuracy : "0.00";
                var altAcc = (coord.altitudeAccuracy != null) ? coord.altitudeAccuracy : "0.00";
                var head = (coord.heading != null) ? coord.heading : "0.00";
                var speed = (coord.speed != null) ? coord.speed : "0.00";
                var timestamp = coord.timestamp;

                intel.xdk.geolocation.successCB(successCallbackID, lat, lng, alt, acc, altAcc, head, speed, timestamp);
            },
            function (err) {
                // Handle the error.
                //debugger;
            }
        );
    },

    watchPosition: function (successCallback, errorCallback, params) {
        watchId = (params.length > 0) ? params[0] : this.getGUID();
        successCallbackID = (params.length > 1) ? params[1] : 0;
        errorCallbackID = (params.length > 2) ? params[2] : 0;
        maximumAge = (params.length > 3) ? params[3] : 0;
        highAccuracy = (params.length > 4) ? params[4] : false;

        var mobiList = new intel.xdk.geolocation.MobiLocationListener(watchId, false, successCallbackID, errorCallbackID, maximumAge, highAccuracy);

        listeners.push(mobiList);

        successCallback(watchId);
    },

    clearWatch: function (successCallback, errorCallback, params) {
        var watchId = params[0];

        var listen;

        for (var i = 0; i < listeners.length; i++) {
            if (listeners[i].ind == watchId) {
                listen = listeners[i];
                successCallback(watchId);
                break;
            }
        }

        listeners.pop(listen);
    },

    pollLocation: function (successCallback, errorCallback, params) {
        if (!polling)
        {
            polling = true;
            var watchId = params[0];
            var listen;

            for (var i = 0; i < listeners.length; i++) {
                if (listeners[i].ind == watchId) {
                    listen = listeners[i];
                    break;
                }
            }

            var geolocator = Windows.Devices.Geolocation.Geolocator();

            geolocator.desiredAccuracy = Windows.Devices.Geolocation.PositionAccuracy.high;

            successCallback(watchId);

            // Get the geoposition, capturing the request in a 'promise' object.
            var promise = geolocator.getGeopositionAsync();
            promise.done(
                function (pos) {
                    // Get the coordinates of the current location.
                    var coord = pos.coordinate;

                    //System.Globalization.CultureInfo ci = new CultureInfo("en-US");

                    var lat = (coord.latitude != null) ? coord.latitude : "0.00";
                    var lng = (coord.longitude != null) ? coord.longitude : "0.00";
                    var alt = (coord.altitude != null) ? coord.altitude : "0.00";
                    var acc = (coord.accuracy != null) ? coord.accuracy : "0.00";
                    var altAcc = (coord.altitudeAccuracy != null) ? coord.altitudeAccuracy : "0.00";
                    var head = (coord.heading != null) ? coord.heading : "0.00";
                    var speed = (coord.speed != null) ? coord.speed : "0.00";
                    var timestamp = coord.timestamp;

                    intel.xdk.geolocation.successCB(successCallbackID, lat, lng, alt, acc, altAcc, head, speed, timestamp);
                    polling = false;
                },
                function (err) {
                    // Handle the error.
                    // debugger;
                }
            );

        }
    },

    getPosition: function(maximumAge, highAccuracy)
    {
        var geolocator = Windows.Devices.Geolocation.Geolocator();

        geolocator.desiredAccuracy = Windows.Devices.Geolocation.PositionAccuracy.high;

        //if (geolocator == null)
        //    geolocator = new Windows.Devices.Geolocation.Geolocator();

        //if (geolocator != null)
        //{
        //    geolocator.DesiredAccuracy = (highAccuracy) ? PositionAccuracy.High : PositionAccuracy.Default;

        //    //this call will also ask the user for permission to their location
        //    geoposition = await geolocator.GetGeopositionAsync(
        //        maximumAge: TimeSpan.FromSeconds(maximumAge),
        //    timeout: TimeSpan.FromSeconds(30)
        //    );
        //}
        //return geoposition;

        // Get the geoposition, capturing the request in a 'promise' object.
        var promise = geolocator.getGeopositionAsync();
        promise.done(
            function (pos) {
                debugger;

                // Get the coordinates of the current location.
                var coord = pos.coordinate;
            },
            function (err) {
                // Handle the error.
                debugger;
            }
        );
    },

    randumNumber: function() {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
    }, 

    getGUID: function (){
        return (randumNumber() + randumNumber() + "-" + randumNumber() + "-" + randumNumber() + "-" + randumNumber() + "-" + randumNumber() + randumNumber() + randumNumber()).toUpperCase();
    }


});

    (function () {
        var MobiLocationListener = WinJS.Class.define(function (ind, once, success, error, maxAge, highAccuracy) {
            this.ind = ind;
            this.once = once;
            this.success = success;
            this.error = error;
            this.maxAge = maxAge;
            this.highAccuracy = highAccuracy;
            this.locationValid = null;
            this.lastLoc = null;

        }, {
            onLocationChanged: function (loc) {
                this.lastLoc = loc;
                this.locationValid = true;
            }
        }, {
            getLast: function () {
                if (!locationValid)
                    return "";

                var js = (oneTime ? 1 : 0) + "," +
                    successID + "," +
                    lastLoc.Coordinate.Latitude + "," +
                    lastLoc.Coordinate.Longitude + "," +
                    lastLoc.Coordinate.Altitude + "," +
                    lastLoc.Coordinate.Accuracy + "," +
                    "0.00" + "," +
                    lastLoc.Coordinate.Heading + "," +
                    lastLoc.Coordinate.Speed + "," +
                    lastLoc.Coordinate.Timestamp;

                this.locationValid = false;

                return js;
            }
        }, {
            fail: function () {
            }
        }, {
            onStatusChanged: function (provider, status) {
                if (status == 0) {  // Out of service.
                    fail();
                }
                else if (status == 1) {
                    // TEMPORARILY_UNAVAILABLE.
                }
                else {
                    // Available
                }
            }
        }, {
            onProviderEnabled: function (provider) {
            }
        }, {
            onProviderDisabled: function (provider) {
                fail();
            }
        });

        WinJS.Namespace.define("intel.xdk.geolocation", {
            MobiLocationListener: MobiLocationListener
        });
    })();
