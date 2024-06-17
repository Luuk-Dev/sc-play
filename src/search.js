const SoundCloudPlaylist = require("./classes/playlist");
const SoundCloudTrack = require("./classes/track");
const getClientId = require("./getClientId.js");
const { request } = require("./request/request.js");
let { clientId } = require("./util.js");

function handleSearchResults(res){
    const results = [];
    const resKeys = Object.keys(res.data);
    if(resKeys.length === 0) return results;
    for(let i = 0; i < res.data.collection.length; i++){
        if(res.data.collection[i].kind === 'track'){
            results.push(new SoundCloudTrack(res.data.collection[i], clientId));
        } else {
            results.push(new SoundCloudPlaylist(res.data.collection[i], clientId));
        }
    }
    return results;
}

function search(query, options){
    return new Promise(async (resolve, reject) => {
        if(typeof query !== 'string') return reject(`Query expected to be a type of string, received ${typeof query}`);
        if(typeof options !== 'object' || Array.isArray(options) || options === null) options = {type: 'tracks', limit: 10};

        if(typeof options.type === 'string'){
            const validTypes = ['tracks', 'playlists', 'albums'];
            if(validTypes.indexOf((options.type ?? 'tracks').toLowerCase()) < 0) return reject(`'${options.type}' is not a valid search type. Use one of ${validTypes.join(', ')}`);
        }

        if(typeof options.limit !== 'number') options.limit = 10;

        if(clientId === null){
            try{
                clientId = await getClientId();
            } catch(err) {
                return reject(err);
            }
        }

        let searchEndpoint = "https://api-v2.soundcloud.com/search"+(typeof options.type === 'string' ? "/"+options.type.toLowerCase() : "")+"?q="+query+"&limit="+options.limit+"&client_id="+clientId;

        request(searchEndpoint, {method: 'GET', responseType: 'json'}).then(res => {
            let results = handleSearchResults(res);
            resolve(results);
        }).catch(async () => {
            try{
                clientId = await getClientId();
            } catch(err) {
                return reject(err);
            }

            request(searchEndpoint, {method: 'GET', responseType: 'json'}).then(res => {
                let results = handleSearchResults(res);
                resolve(results);
            }).catch(reject);
        });
    });
}

module.exports = search;
