<!-- # ![MAO icon](src/chrome/skin/classic/message-archive-options-tb-32x32.png "Message Archive Options") Message Archive Options -->
# Message Archive Options
Message Archive Options is a Thunderbird Add-On that adds the ability to customize the date format
of the archive folders created by the Thunderbird Archive Message function.

This add-on is the original work of Andrew Williamson and with his permission I will be updating
the code for compatibility going forward and possible improvements.

![MAO_version](https://img.shields.io/badge/version-v5.0.0-darkorange.png?label=Message%20Archive%20Options)
[![MAO_tb_version](https://img.shields.io/badge/version-v5.0.0-blue.png?label=Thunderbird%20Add-On)](https://addons.thunderbird.net/en-US/thunderbird/addon/message-archive-options/?src=search)
![Thunderbird_version](https://img.shields.io/badge/version-v5.0b2pre_--_16.*-blue.png?label=Thunderbird)
[![License: MPL 2.0](https://img.shields.io/badge/License-MPL%202.0-red.png)](https://opensource.org/licenses/MPL-2.0)
#

## Message Archive Options Add-On Installation

Normal install from Thunderbird Add-On site:
- Download and install from the add-on menu
- Within Thunderbird ``Tools\Add-ons`` search for 'Message Archive Options' install and reload.

Install XPI directly:
- Download desired version package from the [XPI](xpi) folder.
- Within Thunderbird ``Tools\Add-ons`` click the gear icon and choose ``Install Add-ons From File..``
- Choose XPI file, install and reload.

## XPI Add-On Package Build instructions

1. Make sure that you have [jpm](https://developer.mozilla.org/en-US/Add-ons/SDK/Tools/jpm#Installation) tool installed.
2. Open a terminal in the ./src dir
3. Run ``jpm xpi`` to make the xpi

Note : ``jpm xpi`` adds ``bootstrap.js`` to the src directory, you can delete this as a post-build step: 
Delete using your favorite compression tool WinZip, 7Zip etc...

## Issues & Questions
Post any issues or questions for Message Archive Options under [Issues](https://github.com/cleidigh/Message-archive-options-TB/issues)

## Changelog
Message Archive Options's changes are logged [here](CHANGELOG.md).

## Credits
Original Author: [Andrew Williamson](https://addons.thunderbird.net/en-US/thunderbird/user/eviljeff/ "Andrew Williamson")


