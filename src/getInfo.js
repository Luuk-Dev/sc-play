let { validateURL, validateSoundCloudURL, clientId } = require('./util.js');
const getClientId = require('./getClientId.js');
const { request } = require('./request/request.js');
const SoundCloudTrack = require('./classes/track.js');
const SoundCloudPlaylist = require('./classes/playlist.js');

function requestApi(url){
    return new Promise((resolve, reject) => {
        request(url, {method: 'GET', responseType: 'json'}).then(res => {
            const resKeys = Object.keys(res.data);
            if(resKeys.length === 0) return reject(`URL is not an existing SoundCloud url`);
            if(res.data.kind === 'track') return resolve(new SoundCloudTrack(res.data, clientId));
            else if(res.kind === 'playlist') return resolve(new SoundCloudPlaylist(res.data, clientId));
            else return reject(`Expected kind 'track' or 'playlist', received '${res.data.kind}'`);
        }).catch(reject);
    });
}

function getInfo(url){
    return new Promise(async (resolve, reject) => {
        if(typeof url !== 'string') return reject(`URL is expected to be a type of string, received type of ${typeof url}`);
        const parsed = validateURL(url);
        if(!parsed) return reject(`URL is not a valid URL`);
        if(!validateSoundCloudURL(url)) return reject(`URL is not a valid SoundCloud url`);

        if(clientId === null){
            try{
                clientId = await getClientId();
            } catch(err) {
                return reject(err);
            }
        }

        requestApi(`https://api-v2.soundcloud.com/resolve?url=${parsed.protocol}//${parsed.hostname}${parsed.pathname}&client_id=${clientId}`).then(res => {
            resolve(res);
        }).catch(async () => {
            try{
                clientId = await getClientId();
            } catch(err) {
                return reject(err);
            }

            requestApi(`https://api-v2.soundcloud.com/resolve?url=${parsed.protocol}//${parsed.hostname}${parsed.pathname}&client_id=${clientId}`).then(res => {
                resolve(res);
            }).catch(reject);
        });
    });
}

module.exports = getInfo;
