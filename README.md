# SC Play
SC Play is a package which helps you to create streams and receive information for SoundCloud tracks and playlists.

## Installation
```sh
npm install sc-play
```

## Downloading
To download a SoundCloud track, you can use the `stream` function. The `stream` function requires one argument, which is either the url of the track or the info about the track, which can be received with the [getInfo](#get-info) function. The `stream` function does offer a second argument with some settings you can adjust. The settings you can adjust are:
* highWaterMark: The highWaterMark you'd like to set for the Readable stream (`stream` property)
* download: A boolean which determines whether the package should download the stream for you or not
* format: A number which stands for the index of the format you'd like to download

The most important properties the `SoundCloudStream` class provides are:
* stream: A readable stream of the audio you have downloaded
* url: The url of the stream
* info: The `SoundCloudTrack` the package used to download the stream
Example:
```js
const scplay = require('sc-play');
const fs = require('fs');
const path = require('path');

scplay.stream('https://soundcloud.com/futureisnow/future-metro-boomin-we-still', {
    format: 1,
    download: true,
    highWaterMark: 1048576 * 32
}).then(stream => {
    stream.stream.pipe(fs.createWriteStream(path.join(__dirname, `./audio.mp3`))); // Creates a new file of the song
}).catch(console.log);
```

## Receiving information
You can receive information from both tracks and playlists by using the `getInfo` function. Depending on whether the information is from a track or a playlist, the function returns either the `SoundCloudTrack` or `SoundCloudPlaylist` class. Only one argument is required and available for the `getInfo` function, which is the url of the track or the playlist. The most important properties the `SoundCloudTrack` and `SoundCloudPlaylist` provide are:
* title: The title of the track or playlist
* type: The type (`track` or `playlist`)
* author: An object with information about the artist of the track or creator of the playlist
* songs: (Only for playlists) an array with the songs of the playlist
> The songs property will either provide the `SoundCloudTrack` or the `SoundCloudBaseTrack` class based on the information which has been received by the API. The `SoundCloudBaseTrack` doesn't provide as many properties as the `SoundCloudTrack` does.

Example:
```js
const scplay = require('sc-play');

scplay.getInfo('https://soundcloud.com/futureisnow/future-metro-boomin-we-still').then(info => {
    console.log(info.title); // Output: We Still Don't Trust You
    console.log(info.author.name); // Output: Future
}).catch(console.log);
```

## Searching for tracks, playlists or albums
You can search for tracks, playlists or albums by using the `search` function. The `search` function has one required argument, which is the search query to search the tracks, playlists or albums with. The second argument is optional and allows you to customize the search. The options you can use are:
* limit: The max amount of results you want to receive
* type: The type you want to search for (`tracks`, `playlists` or `albums`)
Example:
```js
const scplay = require('sc-play');

scplay.search('We Still Don\'t Trust You', {
    limit: 5,
    type: 'tracks'
}).then(results => {
    console.log(results) // Output: An array with instances of the SoundCloudTrack class
}).catch(console.log);
```

## Updating the client id
To be able to receive the required information from SoundCloud, a client id is required. The client id automatically gets generated once you perform an action. You can also manually generate one or update it. This can be done by using the `getClientId` function. There are no arguments for this function available.
Example:
```js
const scplay = require('sc-play');

scplay.getClientId().then(clientId => {
    console.log(`New client id:`, clientId);
}).catch(console.log);
```

## Validating a SoundCloud url
You can validate a SoundCloud url by using the `validateSoundCloudURL` function. The function requires one argument, which is the url you'd like to validate.
Example:
```js
const scplay = require('sc-play');

scplay.validateSoundCloudURL('https://soundcloud.com/futureisnow/future-metro-boomin-we-still'); // Output: true
```
