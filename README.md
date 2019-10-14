# local file saver

Aim of project is to be able to send data from one device to another over local connection.  
Wi-Fi setup at home is common and so this project is based on Wi-Fi setup.  
The server is the central location where files on the same network can send files to.

## Usage

1. Start up server on destination(central) device: `npm run start`
2. Open ip/[path] on source device. ("External" IP address shown in command line output)
./index.html => Send files.
./server/index.html => Webpage showing the destination including a QR code for mobile devices.
3. Open file and press save.

## Server specification

Settings:

```json
{
  "logPath": "logs/",
  "path": "files/",
  "key": "userFiles",
  "timeout": 60,
  "debug": false
}
```

REST:

POST sendCount
POST clientKey
FILES [settings.key]

SESSION:

```json
{
  "sendCount": "Number",
  "dirName": "Date",
  "created": "Date",
  "clientKey": "String",
  "completeCount": "Number"
}
```

## To Do

* No reason to use PHP due to being run locally. Should move PHP code out and implement Node.js instead.
* Specify API for external linking.
* Add tests.

## Favicon

http://www.favicon.cc/?action=icon&file_id=62376

## Test images

https://commons.wikimedia.org/wiki/File:Hamster_(1).jpg

## Local server

* Server running PHP required.
* It is possible to start up a local server with external ip information displayed using browser-sync(separate installation required) + server running PHP(XAMPP, etc.).
* Example: `browser-sync start --no-ghost-mode --proxy http://localhost:80`