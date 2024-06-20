let { clientId } = require('./util.js');
const getClientId = require('./getClientId.js');
const { request } = require('./request/request.js');
const SoundCloudTrack = require('./classes/track.js');

function requestApi(url){
    return new Promise((resolve, reject) => {
        request(url, {method: 'GET', responseType: 'json'}).then(res => {
            if(!Array.isArray(res.data)) return reject(`URL is not an existing SoundCloud url`);
            if(res.data.length === 0) return reject(`URL is not an existing SoundCloud url`);
            if(res.data[0].kind === 'track') return resolve(new SoundCloudTrack(res.data[0], clientId));
            else return reject(`Expected kind 'track', received '${res.data[0].kind}'`);
        }).catch(reject);
    });
}

function fetchTrack(trackId){
    return new Promise(async (resolve, reject) => {
        if(typeof trackId === 'string'){
            if(!/^[0-9]*$/.test(trackId)) return reject(`Invalid track id. Track id must be a number.`);
            trackId = parseInt(trackId);
        }
        if(typeof trackId !== 'number') return reject(`Track id is expected to be a type of string or number, received ${typeof trackId}`);

        if(clientId === null){
            try{
                clientId = await getClientId();
            } catch(err) {
                return reject(err);
            }
        }

        requestApi(`https://api-v2.soundcloud.com/tracks?ids=${trackId}&client_id=${clientId}`).then(res => {
            resolve(res);
        }).catch(async () => {
            try{
                clientId = await getClientId();
            } catch(err) {
                return reject(err);
            }

            requestApi(`https://api-v2.soundcloud.com/tracks?ids=${trackId}&client_id=${clientId}`).then(res => {
                resolve(res);
            }).catch(reject);
        });
    });
}

module.exports = fetchTrack;
