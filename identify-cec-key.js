/********************************************************
Copyright (c) 2022 Cisco and/or its affiliates.
This software is licensed to you under the terms of the Cisco Sample
Code License, Version 1.1 (the "License"). You may obtain a copy of the
License at
               https://developer.cisco.com/docs/licenses
All use of the material herein must be in accordance with the terms of
the License. All rights not expressly granted by the License are
reserved. Unless required by applicable law or agreed to separately in
writing, software distributed under the License is distributed on an "AS
IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
or implied.
*********************************************************
 * 
 * Macro Author:      	William Mills
 *                    	Technical Solutions Specialist 
 *                    	wimills@cisco.com
 *                    	Cisco Systems
 * 
 * Version: 1-0-0
 * Released: 10/24/22
 * 
 * This macro assists you with identifying your display manufactures CEC 
 * Key codes from a Webex Device. For example, the Sharp Aquos Link CEC 
 * protocol accepts the key code 64 to enter standby. The macro will try 
 * each key code between a range you can set. You can then monitor the 
 * displays actions while the code is running. Unfortunately the display
 * status doesn't update immediately from the perspective of the Webex 
 * Device. Therefore it isn't possible to set a target state for the Macro
 * to stop once it’s been reached.
 * 
 * Ensure CEC Mode is set to 'On' for your Webex Devcies Video Output and 
 * that your display has HDMI-CEC enabled as per your manufactures settings.
 * 
 * Mondify the config below with the Video Connector Id, CEC Logical Address
 * and the key code start and stop values (min 0, max 255). Increase the
 * delay between attempts if you are getting no results. A min of 2 seconds
 * has worked well for me in the past.
 * 
 ********************************************************/
import xapi from 'xapi';

/*********************************************************
 * Configure the settings below
**********************************************************/

const config = {
  ConnectorId: 2,       // Output Video Connector Id
  LogicalAddress: 0,    // The CEC Logical Address for the diplay
  startKey: 0,          // The initial CEC Key to start with, min 0
  stopKey: 255,         // The last CEC Key to try, max 255
  delay: 2000           // The delay between Key attempts in milliseconds
}

/*********************************************************
 * Main function to setup and add event listeners
**********************************************************/

let test = config.startKey;
console.log(`Testing Keys ${test} to ${config.stopKey}, on Video Output Connector ${config.ConnectorId} ever ${config.delay / 1000} seconds`);

const testing = setInterval(() => {
  if (test > config.stopKey) {
    console.log('Testing complete, now stopping key attempts');
    clearInterval(testing);
  } else {
    console.log(`Testing Key: ${test}`);
    xapi.Command.Video.CEC.Output.KeyClick({
      ConnectorId: config.ConnectorId,
      LogicalAddress: config.LogicalAddress,
      Key: test
    });
    test++;
  }
}, config.delay);
