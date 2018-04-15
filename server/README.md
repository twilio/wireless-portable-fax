
# Portable Fax Machine

### Run the Node.JS Express server

The scripts located in this folder are meant to be run on the Raspberry Pi or using a cloud hosting application such as [Heroku](https://www.heroku.com/).

 ### Steps required to successfully run these scripts
 0. Download this repository to a local directory
 1. Create [Twilio Runtime functions](../runtime)
 2. Run [portable-fax-receiver script](../pi) in a Terminal
 3. Update Node.JS

#### Configure the Express Server
##### `/api/config.js` 
1. Update **line 6** to point to [Twilio Account Sid](https://www.twilio.com/console)
2. Update **line 7** to point to your [Auth Token](https://www.twilio.com/console)
3. Update **line 15** to point to your [Sync Token Function](https://www.twilio.com/console/runtime/functions/manage)
4. Update **line 16** to point to your [Portable Fax Received Function](https://www.twilio.com/console/runtime/functions/manage)
5. Update **line 17** to point to your [Sync Service Sid](https://www.twilio.com/console/sync/services)
6. Save the file

> Need help creating these Functions and Sync Service Sid? Follow the steps in the [runtime directory](../runtime).

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
1. Navigate to the **server** directory on your Raspberry Pi
2. Type `npm install` in a Terminal

#### Run the script!
Follow the next steps in a Terminal.
1. Type `node app.js` in a Terminal
2. Wait for faxes
3. Click the **Print** button
4. Watch them print!

#### Need help sending faxes?
Don't have a fax machine? [Learn how to send faxes using CURL or your language of choice](https://www.twilio.com/docs/fax/send).

