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

package com.intel.xdk.geolocation;

import java.util.Vector;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaInterface;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CordovaWebView;
import org.json.JSONArray;
import org.json.JSONException;

import android.app.Activity;
import android.content.Context;
import android.location.Criteria;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.os.Bundle;
import android.webkit.JavascriptInterface;

@SuppressWarnings("deprecation")
public class Geolocation extends CordovaPlugin{
	public static boolean debug = true;
	LocationManager locMan;
	Vector<MobiLocationListener> listeners;
	boolean listening, watching;
	
	private Activity activity;
	
	public Geolocation(){
	}
	
	@Override
    public void initialize(CordovaInterface cordova, CordovaWebView webView) {
        super.initialize(cordova, webView);
        
        //get convenience reference to activity
        activity = cordova.getActivity();
        
		locMan = (LocationManager)activity.getSystemService(Context.LOCATION_SERVICE);
		listeners = new Vector<MobiLocationListener>();
	}
	
    /**
     * Executes the request and returns PluginResult.
     *
     * @param action            The action to execute.
     * @param args              JSONArray of arguments for the plugin.
     * @param callbackContext   The callback context used when calling back into JavaScript.
     * @return                  True when the action was valid, false otherwise.
     */
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
        if (action.equals("getCurrentPosition")) {
        	//int time = 0;
        	long id = this.getCurrentPosition(args.getInt(0), args.getInt(1), args.getInt(2), args.getBoolean(3));
            callbackContext.success(Long.toString(id));
        }
        else if (action.equals("watchPosition")) {
        	long id = this.watchPosition(args.getInt(0), args.getInt(1), args.getInt(2), args.getInt(3), args.getBoolean(4));
            callbackContext.success(Long.toString(id));
        }
        else if (action.equals("clearWatch")) {
        	long id = this.clearWatch(args.getLong(0));
            callbackContext.success(Long.toString(id));
        }
        else if (action.equals("pollLocation")) {
            String js = this.pollLocation(args.getLong(0));
            callbackContext.success(js);
        }
        else if (action.equals("printMessage")) {
            this.printMessage(args.getString(0));
        }
        else {
            return false;
        }

        // All actions are async.
        //callbackContext.success();
        return true;
    }

	/*
	 * Return current position.
	 * Note:	errorCallback and options arguments may be null.
	 * 			successCallback will be called with latitude, longitude, etc.
	 */
	@JavascriptInterface
	public synchronized long getCurrentPosition(int successCallbackID, int errorCallbackID, 
			int maximumAge, boolean highAccuracy) {
		//TODO: timeout?
		//this.cordova.getThreadPool().execute(new Runnable() {
//		    public void run() {
		//temporarily switch to network instead of gps
		String provider = locMan.NETWORK_PROVIDER;//getBestProvider(highAccuracy);
		MobiLocationListener listener = newListener(true, successCallbackID, errorCallbackID);
		locMan.requestLocationUpdates(provider, 0, 0, listener);
		
		
		//webView.loadUrl(String.format("javascript:intel.xdk.geolocation.setWatchId(%1$d);", listener.index));

		return listener.index;
//		    });
	}

	/*
	 * Return current position periodically until clearWatch is called.
	 * Note:	errorCallback and options arguments may be null.	 
	 * 			successCallback will be called with latitude, longitude, etc.
	 */
	@JavascriptInterface
	public synchronized long watchPosition(int successCallbackID, int errorCallbackID,
			int freq, int maximumAge, boolean highAccuracy) {
		//temporarily switch to network instead of gps
		String provider = locMan.NETWORK_PROVIDER;//getBestProvider(highAccuracy);
		MobiLocationListener listener = newListener(false, successCallbackID, errorCallbackID);
		//TODO: Timeout?
		//System.out.printf("Loc: new watchpoint, freq = %1$d, index = %2$d\n", freq, listener.index);
		locMan.requestLocationUpdates(provider, freq, 0, listener);
		return listener.index;
	}
	
	@JavascriptInterface
	public synchronized long clearWatch(long watchId) {
		MobiLocationListener listener = listeners.elementAt((int)watchId);
		//System.out.println("Loc: clear watchpoint: " + watchId);
		if (listener != null)
			cancelListener(listener);
		
		return watchId;
	}
	
	@JavascriptInterface
	public String pollLocation(long id) {
		if (id < 0 || id >= listeners.size())
			return "";
		
		MobiLocationListener listener = listeners.elementAt((int) id);
		//System.out.println("Geo: pollLocation: id = " + id + ", listeners.index = " + listener.index);
		return listener == null ? "" : listener.getLast();
	}
	
	@JavascriptInterface
	public void printMessage(String s) {
		System.out.println("Geo: " + s);
	}
	
	private String getBestProvider(boolean highAccuracy) {
		Criteria c = new Criteria();
		c.setAccuracy(highAccuracy ? Criteria.ACCURACY_FINE : Criteria.ACCURACY_COARSE);
		String provider = locMan.getBestProvider(c, true);
		//System.out.println("getBestProvider: " + provider);
		return provider;
	}
	
	private synchronized MobiLocationListener newListener(boolean once, int success, int error) {
		int ind = listeners.indexOf(null);	// Get spot for new entry.
		if (ind < 0) {
			ind = listeners.size();
			listeners.setSize(ind + 1);
		}
		MobiLocationListener listener = new MobiLocationListener(ind, once, success, error);
		listeners.setElementAt(listener, ind);
		return listener;
	}
	
	private synchronized void cancelListener(MobiLocationListener listener) {
		locMan.removeUpdates(listener);
		listeners.setElementAt(null, listener.index);
	}
	
	// Define a listener that responds to location updates
	class MobiLocationListener implements LocationListener {
		private int successID, errorID;
		private boolean oneTime, locationValid;
		private int index;
		private Location lastLoc;
		
		private MobiLocationListener(int ind, boolean once, int success, int error) {
			oneTime = once; index = ind;
			successID = success; errorID = error;
		}
	    public void onLocationChanged(Location loc) {
	      // Called when a new location is found by the network location provider.
	    	//System.out.printf("Loc: %1$f, %2$f, %3$f\n", loc.getLatitude(), loc.getLongitude(), loc.getAltitude());
	    	if (lastLoc == null)			// Save for when requested.
	    		lastLoc = new Location(loc);
	    	else
	    		lastLoc.set(loc);
	    	locationValid = true;
	    }
	    public String getLast() {
	    	//System.out.println("Geo: getLast, index = " + index);
	    	if (!locationValid)
	    		return "";
	    	String js = String.format(
	    			"%1$d,%2$d,%3$f,%4$f,%5$f,%6$f,%7$f,%8$f,%9$f,%10$d", oneTime?1:0, successID,
	    			lastLoc.getLatitude(), lastLoc.getLongitude(), lastLoc.getAltitude(),
	    			lastLoc.getAccuracy(), 0.00, lastLoc.getBearing(), lastLoc.getSpeed(),
	    			lastLoc.getTime());
	    	//System.out.println("Geo: getLast: js = " + js);
	    	locationValid = false;
	    	//if (oneTime)
	    	//	cancelListener(this);
	    	return js;
	    }
	    private void fail() {
			webView.loadUrl(String.format("javascript:AppMobi.geolocation.errorCB(%1$d);", errorID));
	    }
	    public void onStatusChanged(String provider, int status, Bundle extras) {
			if(status == 0) {	// Out of service.
				fail();
			} else if(status == 1) {
				// TEMPORARILY_UNAVAILABLE.
			} else {
				// Available
			}
	    }
	    public void onProviderEnabled(String provider) {}
	    public void onProviderDisabled(String provider) {
	    	fail();
	    }
	  };
}
