class SoundCloudBaseTrack{
    constructor(data, clientId){
        this.id = data.id;
        this.partial = true;
        this.type = 'track';
        this.clientId = clientId;
    }
}

module.exports = SoundCloudBaseTrack;
