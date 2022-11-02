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
 * This maco sends perodic telemetry data of all your Webex Devices sensors
 * and can send imediate updates when specific status changes or events occur.
 * 
 * Full Readme and source code availabel on Github:
 * https://github.com/wxsd-sales/telemetry-macro
 * 
 ********************************************************/
import xapi from 'xapi';

/*********************************************************
 * Configure the settings below
**********************************************************/

const config = {
  standbyKey: 64,         // Your displays standbay CEC key code
  buttoName: 'Display Controls', // Name for button and page title
  presets: [        // Create your array of presets
    {
      name: 'Left Only',          // Name for your preset
      displays: ['On', 'Off'],   // Turn on/off diplasys, can be values for codec pro
      roles: ['Auto', 'Auto'],    // Last the output roles
      monitorRole: ['Single'],    // Use single so the image is the same
      osd: 1
    },
    {
      name: 'Right Only',
      displays: ['Off', 'On'],
      roles: ['Auto', 'Auto'],
      monitorRole: ['Single'],
      osd: 2
    },
    {
      name: 'Both Off',
      displays: ['Off', 'Off'],
      roles: ['Auto', 'Auto'],
      monitorRole: ['Auto'],
      osd: 1
    },
    {
      name: "Both On",
      displays: ['On', 'On'],
      roles: ['Auto', 'Auto'],
      monitorRole: ['Auto'],
      osd: 1
    }
  ]
}

/*********************************************************
 * Main function to setup and add event listeners
**********************************************************/

async function turnOffDisplay(id) {
  console.log('Turning off diplay: ' + id);
  // Get the logical address
  const device = await xapi.Status.Video.Output.Connector[id].ConnectedDevice.get()
  console.log(device.CEC[0]);
  let address = 0;
  if (device.hasOwnProperty('CEC'))
    address = device.CEC[0].LogicalAddress
  // Instruct to enter standby
  xapi.Command.Video.CEC.Output.KeyClick(
    {
      ConnectorId: id,
      LogicalAddress: address,
      Key: config.standbyKey
    })
  // Turn off CEC for that output
  xapi.Config.Video.Output.Connector[id].CEC.Mode
    .set('Off');
}

function turnOnDisplay(id) {
  console.log('Turning on diplay: ' + id);
  if(xapi.Config.Video.Output.Connector[id].hasOwnProperty('CEC')) {
    xapi.Config.Video.Output.Connector[id].CEC.Mode.set('On');
  }
  xapi.Command.Video.CEC.Output.SendActiveSourceRequest({ ConnectorId: id });
}

function setOSD(id) {
  console.log('Setting OSD to Output: ' + id)
  xapi.Config.UserInterface.OSD.Output.set(id);
}

function applyPreset(preset) {
  preset.forEach((state, id) => {
    if (state == 'On') {
      turnOnDisplay(id + 1)
    } else if (state == 'Off') {
      turnOffDisplay(id + 1)
    }
  })
}

function setWidgetActive(preset) {
  console.log('Setting preset ' + preset + ' active');
  for (let i = 0; i < config.presets.length; i++) {
    const state = (preset == i) ? 'active' : 'inactive';
    console.log(`Setting Widget  to ${state}`)
    xapi.Command.UserInterface.Extensions.Widget.SetValue(
      { Value: state, WidgetId: 'display-preset-'+i });
  }
}

// Listen for clicks on the buttons
function processWidget(event) {
  if (event.Type !== 'clicked' || !event.WidgetId.startsWith("display-preset")) { return }
  const presetNum = parseInt(event.WidgetId.slice(-1));
  console.log('Display Preset ' + config.presets[presetNum].name + " selected. Setting: " + config.presets[presetNum].displays)
  setWidgetActive(presetNum)
  setOSD(config.presets[presetNum].osd);
  applyPreset(config.presets[presetNum].displays);
}

// Here we create the Button and Panel for the UI
async function createPanel() {
  let presets = '';
  config.presets.forEach((preset, i) => {
    const row = `
      <Row>
        <Options>size=3</Options>
        <Widget>
          <WidgetId>display-preset-${i}</WidgetId>
          <Type>Button</Type>
          <Name>${preset.name}</Name>
          <Options>size=3</Options>
        </Widget>
      </Row>`;
    presets = presets.concat(row);
  })

  const panel = `
    <Extensions>
      <Version>1.9</Version>
      <Panel>
        <Type>Statusbar</Type>
        <Location>HomeScreenAndCallControls</Location>
        <Icon>Tv</Icon>
        <Name>${config.buttoName}</Name>
        <ActivityType>Custom</ActivityType>
        <Page>
          <Name>${config.buttoName}</Name>
          ${presets}
          <Options>hideRowNames=1</Options>
        </Page>
      </Panel>
    </Extensions>`

  xapi.Command.UserInterface.Extensions.Panel.Save(
    { PanelId: 'display-controls' },
    panel
  )
}

createPanel()
xapi.Event.UserInterface.Extensions.Widget.Action.on(processWidget);
