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
      outputRoles: ['Auto', 'Auto'],    // Last the output roles
      monitorRole: 'Single',    // Use single so the image is the same
      osd: 1
    },
    {
      name: 'Right Only',
      displays: ['Off', 'On'],
      outputRoles: ['Auto', 'Auto'],
      monitorRole: 'Single',
      osd: 2
    },
    {
      name: 'Both Off',
      displays: ['Off', 'Off'],
      outputRoles: ['Auto', 'Auto'],
      monitorRole: 'Auto',
      osd: 1
    },
    {
      name: "Both On O:(First Second) M:(Auto)",
      displays: ['On', 'On'],
      outputRoles: ['Auto', 'Auto'],
      monitorRole: 'Auto',
      osd: 1
    },
    {
      name: "Both On O:(Second First) M:(Auto)",
      displays: ['On', 'On'],
      outputRoles: ['First', 'Second'],
      monitorRole: 'Auto',
      osd: 1
    },
    {
      name: "Both On O:(First First) M:(Single)",
      displays: ['On', 'On'],
      outputRoles: ['Auto', 'Auto'],
      monitorRole: 'Single',
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
  const device = await xapi.Status.Video.Output.Connector[id].ConnectedDevice.get();
  let address = 0;
  if (device.hasOwnProperty('CEC')) {
    address = device.CEC[0].LogicalAddress
  }
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

async function turnOnDisplay(id) {
  console.log('Turning on diplay: ' + id);
  await xapi.Config.Video.Output.Connector[id].CEC.Mode.set('On');
  xapi.Command.Video.CEC.Output.SendActiveSourceRequest({ ConnectorId: id });
}

function setOSD(id) {
  console.log('Setting OSD to Output: ' + id)
  xapi.Config.UserInterface.OSD.Output.set(id);
}

function setMonitorRole(mode) {
  console.log('Setting Monitors Roles to: ' + mode)
  xapi.Config.Video.Monitors.set(mode);
}

function setOutputRoles(preset) {
  preset.forEach ( (role, id) => {
    xapi.Config.Video.Output.Connector[id].MonitorRole.set(role);
  })

}

function setDisplays(preset) {
  preset.forEach((state, id) => {
    if (state == 'On') { turnOnDisplay(id + 1) }
    else if (state == 'Off') { turnOffDisplay(id + 1) }
  })

}

function setWidgetActive(preset) {
  for (let i = 0; i < config.presets.length; i++) {
    const state = (preset == i) ? 'active' : 'inactive';
    xapi.Command.UserInterface.Extensions.Widget.SetValue(
      { Value: state, WidgetId: 'display-preset-' + i });
  }
}

// Identify the currect state of the device and which 
// configured preset matches and update the UI accordingly 
async function identifyState() {
  const outputs = await xapi.Status.Video.Output.Connector.get()
  const osd = await xapi.Status.UserInterface.OSD.Output.get()
  const monRole = await xapi.Config.Video.Monitors.get();
  let outputState = []
  for (let i = 0; i < config.presets[0].displays.length; i++) {
    if (outputs[i].hasOwnProperty('ConnectedDevice')) {
      outputState.push(outputs[i].ConnectedDevice.hasOwnProperty('CEC') ? 'On' : 'Off')
    } else {
      outputState.push('Off')
    }
  }
  for (let i = 0; i < config.presets.length; i++) {
    if (JSON.stringify(outputState) == JSON.stringify(config.presets[i].displays)) {
      if (config.presets[i].osd == osd && config.presets[i].monitorRole == monRole)
        setWidgetActive(i)
    }
  }
}

// Listen for clicks on the buttons
function processWidget(event) {
  if (event.Type !== 'clicked' || !event.WidgetId.startsWith("display-preset")) { return }
  const presetNum = parseInt(event.WidgetId.slice(-1))
  const preset = config.presets[presetNum];
  console.log('Display Preset ' + preset.name + " selected. Setting: " + preset.displays)
  setWidgetActive(presetNum)
  setOSD(preset.osd);
  setMonitorRole(preset.monitorRole);
  setOutputRoles(preset.outputRoles)
  setDisplays(preset.displays);
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
          <Options>size=4</Options>
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
  ).then(identifyState)
}

createPanel()
xapi.Event.UserInterface.Extensions.Widget.Action.on(processWidget);
