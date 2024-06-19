class SoundCloudTrack{
    constructor(data, clientId){
        this.uploaded = new Date(data.created_at);
        this.description = data.description;
        this.duration = data.full_duration ?? data.duration;
        this.genre = data.genre;
        this.id = data.id;
        this.title = data.title;
        this.likes = data.likes_count;
        this.url = data.permalink_url;
        this.streams = data.playback_count;
        this.author = {
            name: data.user.username,
            image: data.user.avatar_url,
            url: data.user.permalink_url,
            followers: data.user.followers_count
        },
        this.formats = data.media.transcodings;
        this.partial = false;
        this.thumbnail = data.artwork_url;
        this.type = 'track';
        this.clientId = clientId;
    }
}

module.exports = SoundCloudTrack;
