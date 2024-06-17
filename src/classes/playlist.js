const SoundCloudBaseTrack = require("./basetrack");
const SoundCloudTrack = require("./track");

class SoundCloudPlaylist{
    constructor(data, clientId){
        this.created = new Date(data.created_at);
        this.description = data.description;
        this.duration = data.duration;
        this.genre = data.genre;
        this.id = data.id;
        this.title = data.title;
        this.likes = data.likes_count;
        this.author = {
            name: data.user.username,
            image: data.user.avatar_url,
            url: data.user.permalink_url,
            followers: data.user.followers_count
        },
        this.songs = [];
        for(let i = 0; i < data.tracks.length; i++){
            let track = data.tracks[i];
            if(typeof track.title === 'string'){
                this.songs.push(new SoundCloudTrack(track, clientId));
            } else {
                this.songs.push(new SoundCloudBaseTrack(track, clientId));
            }
        }
        this.type = 'playlist';
        this.clientId = clientId;
    }
}

module.exports = SoundCloudPlaylist;
