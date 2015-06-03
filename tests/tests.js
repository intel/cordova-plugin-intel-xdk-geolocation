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

/*global exports, describe, it, xit, expect, intel, console */

exports.defineAutoTests = function () {
    'use strict';
    
    describe('intel.xdk.gelocation tests', function () {
        it('intel.xdk.geolocation should be defined', function () {
            expect(intel.xdk.geolocation).toBeDefined();
        });
        
        it('should have a getCurrentPosition method', function () {
            expect(intel.xdk.geolocation.getCurrentPosition).toBeDefined();
        });
        
        it('should have a watchPosition method', function () {
            expect(intel.xdk.geolocation.watchPosition).toBeDefined();
        });
        
        it('should have a clearWatch method', function () {
            expect(intel.xdk.geolocation.clearWatch).toBeDefined();
        });
        
        /** this spec is failling */
        xit('should have a pollLocation method', function () {
            expect(intel.xdk.geolocation.pollLocation).toBeDefined();
        });

        /** this spec is failling */
        xit('should have a printMessage method', function () {
            expect(intel.xdk.geolocation.printMessage).toBeDefined();
        });
    });
};

exports.defineManualTests = function (contentEl, createActionButton) {
    'use strict';
    
    /** object to hold properties and configs */
    var TestSuite = {};
    
    function logMessage(message, color) {
        var log = document.getElementById('info'),
            logLine = document.createElement('div');
        
        if (color) {
            logLine.style.color = color;
        }
        
        logLine.innerHTML = message;
        log.appendChild(logLine);
    }

    function clearLog() {
        var log = document.getElementById('info');
        log.innerHTML = '';
    }
    
    function testNotImplemented(testName) {
        return function () {
            console.error(testName, 'test not implemented');
        };
    }
    
    function init() {}
    
    TestSuite.$markup = '<h3>Get Current Position</h3>' +
        '<div id="buttonGetCurrentPosition"></div>' +
        'Expected result: should log current position' +
        
        '<h3>Watch Position</h3>' +
        '<div id="buttonWatchPosition"></div>' +
        'Expected result: should start logging position' +
    
        '<h3>Clear Watch</h3>' +
        '<div id="buttonClearWatch"></div>' +
        'Expected result: should stop logging position';
    
    TestSuite.watch_id = null;
    
    TestSuite.onSuccess = function (p) {
        console.log('success');
        clearLog();
        logMessage(JSON.stringify(p, null, '\t'), 'green');
    };
    
    TestSuite.onFail = function () {
        console.error('fail');
    };
        
    contentEl.innerHTML = '<div id="info"></div>' + TestSuite.$markup;
    
    createActionButton('getCurrentPosition()', function () {
        console.log('execute::intel.xdk.geolocation.getCurrentPosition');
        intel.xdk.geolocation.getCurrentPosition(TestSuite.onSuccess, TestSuite.onFail);
    }, 'buttonGetCurrentPosition');
    
    createActionButton('watchPosition()', function () {
        if (TestSuite.watch_id === null) {
            console.log('execute::intel.xdk.geolocation.watchPosition');
            TestSuite.watch_id = intel.xdk.geolocation.watchPosition(TestSuite.onSuccess, TestSuite.onFail);
        }
    }, 'buttonWatchPosition');
    
    createActionButton('clearWatch()', function () {
        if (TestSuite.watch_id !== null) {
            intel.xdk.geolocation.clearWatch(TestSuite.watch_id);
            TestSuite.watch_id = null;
        }
    }, 'buttonClearWatch');
    
    document.addEventListener('deviceready', init, false);
};