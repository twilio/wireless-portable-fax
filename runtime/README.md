
# Portable Fax Machine
### Twilio Functions scripts
The scripts located in this directory are meant to run on [Twilio Functions](https://www.twilio.com/functions).

### What is Functions?
Serverless architecture is a software design pattern where applications are hosted by a third-party service, eliminating the need for server software and hardware management by the developer. Applications are broken up into individual functions that can be invoked and scaled individually.

### Steps required to successfully run these scripts
1. Create a [Twilio account](https://www.twilio.com/try-twilio) if you don't already have one.
2. Create a Sync Service Instance
3. Create an API Key
4. Create configuration variables for the your Functions
5. Create the Portable Fax Machine Received Function
6. Create the Portable Fax Token Function
7. Create TwiML to receive faxes
8. Provision a Twilio fax-enabled phone number
9. Set the phone number to point to your newly created Function

### Create a Sync Service Instance
Twilio Sync is used for synchronization and data storage for this fax-machine's state. Complete the following steps to a Sync Service Instance:

-   Visit [Sync Services](https://www.twilio.com/console/sync/services) to create a new instance
-   Click the **red + button**
-   Name your new service **PORTABLE_FAX_MACHINE_SYNC_SERVICE_SID**
-   Click the **Create** button
-   Make note of the **Service Sid** for later

### Create a new API Key
An API key is a revocable credential used to access Twilio services.

To create a new key:

-   Visit [API Keys](https://www.twilio.com/console/dev-tools/api-keys)
-   Click the **red + button**
-   Enter **Portable Fax Machine** as the Friendly Name
-   Click **Create API Key**
-   Make a note of the **Key Sid**
-   Make a note of the **Key Secret**
-   Click **Done**

> This secret is only shown ONCE. Make note of it and store it in a safe, secure location.

### Create Function environment variables

1. Visit [Configuration](https://www.twilio.com/console/runtime/functions/configure) for Functions
2. Enter the following names and their respective keys (see above steps) in the input fields.
	* PORTABLE_FAX_MACHINE_SYNC_SERVICE_SID
	* PORTABLE_FAX_MACHINE_API_KEY
	* PORTABLE_FAX_MACHINE_API_SECRET
3. Click **Save**
	

### Install the `portable-fax-received.js` Function
1. Navigate to [Functions](https://www.twilio.com/console/runtime/functions/manage)
2. Click the **red + button**
3. Click the **Blank** template
4. Click the **Create** button
5. Enter **Portable Fax Receiver** in the **Function Name** input field
6. Enter **portable-fax-received** in the **Path** input field
7. Copy the contents of `portable-fax-received.js` in to the **Code** text box.
8. Click the **Save** button
9. Click the **Copy button** to the right of the **Path** input field
10. Make note of this URL

> You will use this URL when provisioning your Twilio phone number.
 
### Install the `portable-fax-token.js` Function
1. Navigate to [Functions](https://www.twilio.com/console/runtime/functions/manage)
2. Click the red + button
3. Click the **Blank** template
4. Click the **Create** button
5. Enter **Portable Fax Token** in the **Function Name** input field
6. Copy the contents of `portable-fax-token.js` in to the **Code** text box
7. Click the **Save** button
8. Click the **Copy button** to the right of the **Path** input field
10. Make note of this URL

> You will use this URL when requesting a Sync token.
### Create TwiML to receive faxes
TwiML is required to be hit to receive a Fax.

1. Navigate to [TwiML Bins](https://www.twilio.com/console/runtime/twiml-bins)
2. Click the **red + button**
3. Enter **Portable Fax Received** for the **Friendly Name**
4. Copy the contents of `portable-fax-received.twiml` in to the **Code** text box
5. Replace **{{YOUR-RUNTIME-DOMAIN-HERE}}** with the name of [your Runtime Domain](https://www.twilio.com/console/runtime/overview)
6. Click **Save**

### Provision a fax-enabled Twilio phone number
You will need a Twilio phone number to receive Faxes.

1. Visit the [Buy a Number](https://www.twilio.com/console/phone-numbers/search) section of the Console
2. Enter an area code of your choice in the input field
3. Check at least **Fax** from the Capabilities checkbox
4. Click **Search**
5. Find a phone number
6. Click the **Buy** button
7. Click the **Buy This Number** button
8. Click the **Setup number** button
9. Select **TwiML** to right of the input field that says **When a call comes in** under the **Voice & Fax** section
10. Select  the **Portable Fax Received** TwiML created in the previous section
11. Click **Save**

Continue by going to the [server](../server) or [pi](../pi) folder.