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

using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Windows.Devices.Geolocation;
using WPCordovaClassLib.Cordova;
using WPCordovaClassLib.Cordova.Commands;
using WPCordovaClassLib.CordovaLib;

namespace Cordova.Extension.Commands
{
    public class IntelXDKGeolocation : BaseCommand
    {
        #region private variables
        Geolocator geolocator;

        private bool polling = false;

        private List<MobiLocationListener> listeners = new List<MobiLocationListener>();

        int successCallbackID = 1;
        int errorCallbackID = 1;
        int maximumAge = 10;
        bool highAccuracy = true;
        int watchId = 0;
        #endregion

        #region constructor
        public IntelXDKGeolocation()
            { }
        #endregion

        #region appMobi.js public methods
        /// <summary>
        /// Get the currrent geolocation position
        /// </summary>
        /// <param name="parameters"></param>
        public async void getCurrentPosition(string parameters)
        {
            string[] args = WPCordovaClassLib.Cordova.JSON.JsonHelper.Deserialize<string[]>(parameters);
            if (args.Length > 3)
            {
                successCallbackID = int.Parse(args[0]);
                errorCallbackID = int.Parse(args[1]);
                maximumAge = int.Parse(args[2]);
                highAccuracy = bool.Parse(args[3]);
            }

            Geoposition geoposition = await GetPosition(maximumAge, highAccuracy);

            Geocoordinate cord = geoposition.Coordinate;

            System.Globalization.CultureInfo ci = new CultureInfo("en-US");

            // AppMobi.Geolocation.prototype.successCB = function (ID, latitude, longitude, altitude, accuracy, altitudeAccuracy, heading, speed, timestamp) {
            var js = string.Format(ci, "javascript:intel.xdk.geolocation.successCB({0},{1},{2},{3},{4},{5},{6},{7},'{8}');", successCallbackID,
                (cord.Latitude != null) ? cord.Latitude : 0.00,
                (cord.Longitude != null) ? cord.Longitude : 0.00,
                (cord.Altitude != null) ? cord.Altitude : 0.00,
                (cord.Accuracy != null) ? cord.Accuracy : 0.00,
                (cord.AltitudeAccuracy != null) ? cord.AltitudeAccuracy : 0.00,
                (cord.Heading != null) ? cord.Heading : 0.00,
                (cord.Speed != null) ? cord.Speed : 0.00,
                cord.Timestamp);

            //DispatchCommandResult(new PluginResult(PluginResult.Status.OK, js));
            InvokeCustomScript(new ScriptCallback("eval", new string[] { js }), true);
            //InjectJS(js);
        }

        public void watchPosition(string parameters)
        {
            string[] args = WPCordovaClassLib.Cordova.JSON.JsonHelper.Deserialize<string[]>(parameters);
            int currentWatchId = watchId;

            successCallbackID = (args.Length > 0) ? int.Parse(args[0]) : 0;
            errorCallbackID = (args.Length > 1) ? int.Parse(args[1]) : 0;
            maximumAge = (args.Length > 3) ? int.Parse(args[3]) : 0;
            highAccuracy = (args.Length > 4) ? bool.Parse(args[4]) : false;

            MobiLocationListener mobiList = new MobiLocationListener(watchId, false, successCallbackID, errorCallbackID, maximumAge, highAccuracy);

            listeners.Add(mobiList);
            watchId++;
            DispatchCommandResult(new PluginResult(PluginResult.Status.OK, currentWatchId));
        }

        public void clearWatch(string parameters)
        {
            string[] args = WPCordovaClassLib.Cordova.JSON.JsonHelper.Deserialize<string[]>(parameters);
            int watchId = 0;
            int.TryParse(args[0], out watchId);

            MobiLocationListener listen = listeners.Where<MobiLocationListener>(x => x.index == watchId).FirstOrDefault();
            listeners.Remove(listen);
            DispatchCommandResult(new PluginResult(PluginResult.Status.OK, watchId));

        }

        public async void pollLocation(string parameters)
        {
            if (!polling)
            {
                polling = true;
                string[] args = WPCordovaClassLib.Cordova.JSON.JsonHelper.Deserialize<string[]>(parameters);
                int watchId = int.Parse(args[0]);

                MobiLocationListener listen = listeners.Where<MobiLocationListener>(x => x.index == watchId).FirstOrDefault();

                if (listen != null)
                {
                    Geoposition geoposition = await GetPosition(listen.maxAge, listen.highAccuracy);

                    Geocoordinate cord = geoposition.Coordinate;

                    System.Globalization.CultureInfo ci = new CultureInfo("en-US");

                    // AppMobi.Geolocation.prototype.successCB = function (ID, latitude, longitude, altitude, accuracy, altitudeAccuracy, heading, speed, timestamp) {
                    var js = string.Format(ci, "javascript:intel.xdk.geolocation.successCB({0},{1},{2},{3},{4},{5},{6},{7},'{8}');", listen.successID,
                        (cord.Latitude != null) ? cord.Latitude : 0.00,
                        (cord.Longitude != null) ? cord.Longitude : 0.00,
                        (cord.Altitude != null) ? cord.Altitude : 0.00,
                        (cord.Accuracy != null) ? cord.Accuracy : 0.00,
                        (cord.AltitudeAccuracy != null) ? cord.AltitudeAccuracy : 0.00,
                        (cord.Heading.HasValue && !Double.IsNaN(cord.Heading.Value)) ? cord.Heading : 0.00,
                        (cord.Speed.HasValue && !Double.IsNaN(cord.Speed.Value)) ? cord.Speed : 0.00,
                        cord.Timestamp);
                    //InjectJS(js);
                    InvokeCustomScript(new ScriptCallback("eval", new string[] { js }), true);
                }
                polling = false;
            }
        }
        #endregion

        #region private methods
        public async Task<Geoposition> GetPosition(int maximumAge, bool highAccuracy)
        {
            Geoposition geoposition=null;

            if (geolocator == null)
                geolocator = new Windows.Devices.Geolocation.Geolocator();

            if (geolocator != null)
            {
                geolocator.DesiredAccuracy = (highAccuracy) ? PositionAccuracy.High : PositionAccuracy.Default;

                //this call will also ask the user for permission to their location
                geoposition = await geolocator.GetGeopositionAsync(
                    maximumAge: TimeSpan.FromSeconds(maximumAge),
                    timeout: TimeSpan.FromSeconds(30)
                );
            }
            return geoposition;
        }
        #endregion

        // Define a listener that responds to location updates
        private class MobiLocationListener
        {
            public int index;
            public int successID, errorID;
            public bool oneTime, locationValid;
            public Geoposition lastLoc;
            public int maxAge;
            public bool highAccuracy;

            public MobiLocationListener(int ind, bool once, int success, int error, int maxAge, bool highAccuracy)
            {
                this.index = ind;
                this.oneTime = once;
                this.successID = success;
                this.errorID = error;
                this.maxAge = maxAge;
                this.highAccuracy = highAccuracy;
            }
            public void onLocationChanged(Geoposition loc)
            {
                // Called when a new location is found by the network location provider.
                //System.out.printf("Loc: %1$f, %2$f, %3$f\n", loc.getLatitude(), loc.getLongitude(), loc.getAltitude());
                lastLoc = loc;
                locationValid = true;
            }
            public String getLast()
            {
                //System.out.println("Geo: getLast, index = " + index);
                if (!locationValid)
                    return "";
                String js = String.Format(
                        "{0},{1},{2},{3},{4},{5},{6},{7},{8},{9}", oneTime ? 1 : 0, successID,
                        lastLoc.Coordinate.Latitude, lastLoc.Coordinate.Longitude, lastLoc.Coordinate.Altitude,
                        lastLoc.Coordinate.Accuracy, 0.00, lastLoc.Coordinate.Heading, lastLoc.Coordinate.Speed,
                        lastLoc.Coordinate.Timestamp);
                //System.out.println("Geo: getLast: js = " + js);
                locationValid = false;
                //if (oneTime)
                //cancelListener(this);
                return js;
            }
            private void fail()
            {
                //injectJS(String.format("javascript:AppMobi.geolocation.errorCB(%1$d);", errorID));
            }
            public void onStatusChanged(String provider, int status)
            {
                if (status == 0)
                {   // Out of service.
                    fail();
                }
                else if (status == 1)
                {
                    // TEMPORARILY_UNAVAILABLE.
                }
                else
                {
                    // Available
                }
            }
            public void onProviderEnabled(String provider) { }
            public void onProviderDisabled(String provider)
            {
                fail();
            }
        }
    }
}
