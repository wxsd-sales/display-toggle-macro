# Display Toggle Macro
This is a simple macro which makes it easy to turn on and off your Webex Room Devices third party video displays. Preset display configurations can be easily added the macro, making it possible to manage multiple configuration all from your devices Touch device.

![image](https://user-images.githubusercontent.com/21026209/198811375-e3bebc3e-6edd-4dca-a4b8-098a0f1108c1.png)

## Requirements

1. RoomOS 9 or 10 on a Webex Room Series Device with two displays or more displays
2. Web admin access to the device to uplaod the macro.
3. All thrid party displays which you want to power on and off must support HDMI-CEC

## Setup

1. Download the ``display-toggle.js`` file and upload it to your Webex Room devices Macro editor via the web interface.
2. Configure the Macro by changing the initial values, there are comments explaining each of one.
3. Enable the Macro on the editor.
4. Ensure that you have enabled CEC for your output displays via its OSD settings.


## Validation
This Macro was developed and tested on a Webex Codec Pro and an SX80. Other Webex devices may also work but have not been validated. Ensure that the Webex Devices video outputs you wish to use this macro on support HDMI-CEC.

## Support

Please reach out to the WXSD team at [wxsd@external.cisco.com](mailto:wxsd@external.cisco.com?subject=display-toggle-macro).
