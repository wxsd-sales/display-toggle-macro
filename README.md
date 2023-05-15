# Display Toggle Macro
This is a simple macro which makes it easy to turn on and off your Webex Room Devices third party video displays. It includes preset display configurations which can be easily customised in the macro macros config, making it possible to manage multiple displays configuration all from your devices Touch device.

![image](https://user-images.githubusercontent.com/21026209/198811375-e3bebc3e-6edd-4dca-a4b8-098a0f1108c1.png)

## Overview

The macro will automatically add a Button to your Touch devices UI, this will be available both in and out of calls. Tapping on it will open a panel with a list of available presets which can be changed in the macros config. The preset 'Left Only' will power off the display attached to video output 2 and move all the content to video output 1.

## Setup

### Prerequisites & Dependencies: 

- RoomOS 9 or 10 on a Webex Room Series Device with two displays or more displays
- Web admin access to the device to upload the macro.
- All third party displays which you want to power on and off must support HDMI-CEC


### Installation Steps:
1. Download the ``display-toggle.js`` file and upload it to your Webex Room devices Macro editor via the web interface.
2. Configure the macro by changing the config at the beginning of the file, you can modify or add new presets depending on your Room Devices available outputs and number of connected displays. There are comments included for each of the config settings.
3. Enable the Macro on the editor.
4. Ensure that you have enabled CEC for your output displays via its OSD settings.
    

### Identifying The Correct CEC Key

The macro puts your displays into standby and then turns off CEC for that video output to prevent the room system from waking it back up again. Each display manufacture may use different CEC key codes to perform different operations. To help you find the key for standby on your display, the additional macro ``identify-cec-key.js`` is included in this repro. Load it onto your device and set the Connector Id, CEC Logical Address and CEC Key start and stop values in the configuration. Ensure your display is powered on and then run the macro. You can then wait to see when the displays enters standby and note the last CEC key code which was used from the macros log output. If you see no activity, increase the delay setting in the macros config as it may be trying keys too quickly for your display to accept, by default it is set to 2000 milliseconds (2 seconds).

## Validation
This Macro was developed and tested on a Webex Codec Pro and an SX80. Other Webex devices may also work but have not been validated. Ensure that the Webex Devices video outputs you wish to use this macro on support HDMI-CEC.

  
## Demo

*For more demos & PoCs like this, check out our [Webex Labs site](https://collabtoolbox.cisco.com/webex-labs).


## License

All contents are licensed under the MIT license. Please see [license](LICENSE) for details.


## Disclaimer

Everything included is for demo and Proof of Concept purposes only. Use of the site is solely at your own risk. This site may contain links to third party content, which we do not warrant, endorse, or assume liability for. These demos are for Cisco Webex use cases, but are not Official Cisco Webex Branded demos.


## Questions
Please contact the WXSD team at [wxsd@external.cisco.com](mailto:wxsd@external.cisco.com?subject=display-toggle-macro) for questions. Or, if you're a Cisco internal employee, reach out to us on the Webex App via our bot (globalexpert@webex.bot). In the "Engagement Type" field, choose the "API/SDK Proof of Concept Integration Development" option to make sure you reach our team. 
