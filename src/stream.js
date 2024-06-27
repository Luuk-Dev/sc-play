let { clientId } = require('./util.js');
const getClientId = require('./getClientId.js');
const { request } = require('./request/request.js');
const SoundCloudTrack = require('./classes/track.js');
const getInfo = require('./getInfo');
const SoundCloudStream = require('./classes/stream.js');

function getDownloadURL(url){
    return new Promise((resolve, reject) => {
        request(url, {method: 'GET', responseType: 'json'}).then(res => {
            const resKeys = Object.keys(res.data);
            if(resKeys.length === 0) return reject(`No valid download url's were found`);
            if(typeof res.data.url !== 'string') return reject(`No valid download url's were found`);
            resolve(res.data.url);
        }).catch(reject);
    });
}

function createStream(url, info, format, options){
    return new Promise((resolve) => {
        let stream = new SoundCloudStream({
            url: url,
            options: options,
            format: format,
            info: info
        });

        if(stream.ready === true){
            resolve(stream);
        } else {
            stream.once('ready', () => {
                resolve(stream);
            });
        }
    });
}

function getUrl(info, options){
    let urls = info.formats.map(f => f.url += "?client_id="+clientId);
    if(typeof options.format !== 'number') options.format = 0;
    if(options.format >= urls.length) options.format = 0;
    let downloadUrl = urls[options.format];
    return {url: downloadUrl, format: info.formats[options.format]};
}

function stream(info, options){
    return new Promise(async (resolve, reject) => {
        if(typeof info === 'string'){
            try{
                info = await getInfo(info);
            } catch(err) {
                return reject(err);
            }
        } else if(!(info instanceof SoundCloudTrack)){
            return reject(`The first argument must be either a valid SoundCloud url or an instance of the SoundCloudTrack`);
        }

        if(typeof options !== 'object' || Array.isArray(options) || options === null) options = {download: true, format: 1, highWaterMark: 1048576 * 32};

        if(clientId === null){
            try{
                clientId = await getClientId();
            } catch(err) {
                return reject(err);
            }
        }

        let downloadUrl = getUrl(info, options);
        if(!downloadUrl?.url) return reject(`No valid download url's were found`);

        getDownloadURL(downloadUrl.url).then(async res => {
            let stream = await createStream(res, info, downloadUrl.format, options);
            resolve(stream);
        }).catch(async () => {
            try{
                clientId = await getClientId();
            } catch(err) {
                return reject(err);
            }

            getDownloadURL(getUrl(info, options)).then(async res => {
                let stream = await createStream(res, info, options);
                resolve(stream);
            });
        });
    });
}

module.exports = stream;
