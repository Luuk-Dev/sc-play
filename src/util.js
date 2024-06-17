const validateURL = (url) => {
    try{
        return new URL(url);
    } catch {
        return false;
    }
}

const validateSoundCloudURL = (url) => {
    if(typeof url !== 'string') return false;
    const parsed = validateURL(url);
    if(!parsed) return false;
    return /https:\/\/soundcloud.com\/*(.+)\/*(.+)/.test(url);
}

let clientId = null;

module.exports = { validateURL, validateSoundCloudURL, clientId };
