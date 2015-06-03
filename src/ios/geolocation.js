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

var channel = require('cordova/channel'),
    utils = require('cordova/utils');

channel.createSticky('IntelXDKGeolocation');
channel.waitForInitialization('IntelXDKGeolocation');
channel.onCordovaReady.subscribe(function() {
    if (typeof(intel) != "object") intel = {};
    if (typeof(intel.xdk) != "object") intel.xdk = {};
    intel.xdk.geolocation = navigator.geolocation;
    channel.IntelXDKGeolocation.fire();
});
