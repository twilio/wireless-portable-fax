
# Portable Fax Machine

### Set up the Raspberry Pi Portable Fax Receiver script

The scripts located in this folder are meant to be run on the Raspberry Pi operating system to receive and print faxes from Twilio.
 
 ### Steps required to successfully run these scripts
 0. Download this repository to a local directory
 1. Create [Twilio Runtime functions](../runtime)
 2. Run [Express server application](../server)
 3. Update Node.JS

#### Configure the fax receiver script
##### `config.js` 
1. Update **line 6** to point to your [**Portable Fax Token**](../runtime)
2. Save the file

##### `portable-fax-receiver.js`
1. Replace **line 12** with the path of your USB interface
2. Type `ls /dev/{tty,cu}.*` if using the [USB to TTL Serial interface](https://www.amazon.com/gp/product/B075N82CDL/ref=oh_aui_detailpage_o04_s00?ie=UTF8&psc=1) to find the path

#### Using serial instead of the USB to TTL interface?
1. Connect GND, RX and TX to the Raspberry Pi GPIO header 
2. Connect **TX** on the printer pin to **RXD** on the Pi
3. Connect **RX** on the printer to **TXD** on the Pi

The path should be `/dev/serial0`

> Learn more about TTL and [connecting and configuring a printer to a Raspberry Pi](https://learn.adafruit.com/networked-thermal-printer-using-cups-and-raspberry-pi/connect-and-configure-printer).

#### How to update Node.JS on a Raspberry Pi
Node.JS comes preinstalled with the Raspbian operating system. In this section you will update Node.JS to the latest version.

#### Update Node.JS
Follow the next steps in a Terminal.

1. Type `sudo apt update` to make sure apt is up to date
2. Type `curl -sL https://deb.nodesource.com/setup_9.x | sudo -E bash -`
3. Type `sudo apt install -y nodejs`

> Want to learn more about configuring the Raspbian operating system? [Visit this guide](http://thisdavej.com/beginners-guide-to-installing-node-js-on-a-raspberry-pi/) for first time configuration of the Raspbian operating system.

#### Install the modules
Follow the next steps in a Terminal.
1. Navigate to the **pi** directory on your Raspberry Pi
2. Type `npm install` in a Terminal

#### Run the script!
Follow the next steps in a Terminal.
1. Type `node portable-fax-receiver.js` in a Terminal
2. Wait for faxes
3. Watch them print!

Have you set up your Express server yet? Follow along in the [server directory](../server).
