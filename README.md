intel.xdk.geolocation
=====================

Make your application aware of where it is currently located

>   _This Intel XDK Cordova plugin and API has been deprecated. Please use the
>   equivalent standard Cordova geolocation plugin instead._

Methods
-------

-   [clearWatch](#clearwatch) — This method stops the process started by
    watchPosition when it is passed the appropriate watch timer object.
-   [getCurrentPosition](#getcurrentposition) — Use this command to get the
    current location of the device.
-   [watchPosition](#watchposition) — Use this command rather than the
    getCurrentLocation command to track progress during a trip rather than just
    getting a single position.

### clearWatch

This method stops the process started by watchPosition when it is passed the
appropriate watch timer object.

```javascript
intel.xdk.geolocation.clearWatch(watchTimer);
```

#### Available Platforms

-   Apple iOS
-   Google Android
-   Microsoft Windows 8 - BETA
-   Microsoft Windows Phone 8 - BETA

#### Parameters

-   **watchTimer:** The returned watch returned from the previous
    [intel.xdk.geolocation.watchPosition](#watchposition) command.

#### Example

```javascript
var geolocationWatchTimer = 
    intel.xdk.geolocation.watchPosition(suc,fail,options);
intel.xdk.geolocation.clearWatch(geolocationWatchTimer);
```

### getCurrentPosition

Use this command to get the current location of the device.

```javascript
intel.xdk.geolocation.getCurrentPosition(successFunction,errorFunction);
```

#### Description

Use this command to get the current location. This command asynchronously
acquires the approximate latitude and longitude of the device. When data is
available, the success function is called. If there is an error getting position
data, the error function is called.

#### Available Platforms

-   Apple iOS
-   Google Android
-   Microsoft Windows 8 - BETA
-   Microsoft Windows Phone 8 - BETA

#### Parameters

-   **successFunction:** When data is available, this success function is
    called.
-   **errorFunction:** If there is an error getting position data, the error
    function is called.

#### Example

```javascript
var getLocation = function()
{
    var suc = function(p){
        alert("geolocation success");
        if (p.coords.latitude != undefined)
        {
            currentLatitude = p.coords.latitude;
            currentLongitude = p.coords.longitude;
        }

    };
    var fail = function(){
        alert("geolocation failed");
        getLocation();
    };

    intel.xdk.geolocation.getCurrentPosition(suc,fail);
}
```

### watchPosition

Use this command rather than the getCurrentLocation command to track progress
during a trip rather than just getting a single position.

```javascript
var watchTimer = 
    intel.xdk.geolocation.watchPosition(successFunction,errorFunction,options);
```

#### Description

Use this command rather than the getCurrentLocation command to track progress
during a trip rather than just getting a single position. This command
asynchronously acquires the latitude and longitude of the device. When data is
available, the success function is called. If there is an error getting position
data, the error function is called.

#### Available Platforms

-   Apple iOS
-   Google Android
-   Microsoft Windows 8 - BETA
-   Microsoft Windows Phone 8 - BETA

#### Parameters

-   **successFunction:** When data is available, this success function is
    called.
-   **errorFunction:** If there is an error getting position data, the error
    function is called.
-   **options:** Some options may be specified for the method as an array
    object.

|Option             |Possible Values|Use|
|-------------------|---------------|---|
|timeout            |(an integer)   |The number of milliseconds between checks of position rather than the default value of 10000 (or ten seconds).|
|enableHighAccuracy |True           |This will force the command to report back a more accurate latitude and longitude position at the expense of more battery usage.|
|maximumAge         |(an integer)   |The number of milliseconds the command will wait before deciding that it cannot get a new position reading and instead run the error message.|


#### Example

```javascript
//This array holds the options for the command
var options = {timeout: 10000, maximumAge: 11000, enableHighAccuracy: true };

//This function is called on every iteration of the watch Position command that 
//fails
var fail = function(){
  alert("Geolocation failed. \nPlease enable GPS in Settings.");
};

//This function is called on every iteration of the watchPosition command that 
// is a success
var suc = function(p){
  alert("Moved To: Latitude:" + p.coords.latitude + "Longitude:" + 
    p.coords.longitude);
};

//This command starts watching the geolocation
var geolocationWatchTimer = 
    intel.xdk.geolocation.watchPosition(suc,fail,options);

//Call the stopGeolocation function to stop the geolocation watch
var stopGeolocation = function(){
        intel.xdk.geolocation.clearWatch(geolocationWatchTimer);
}
```

