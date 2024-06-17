let { clientId } = require('./util.js');
const { request } = require('./request/request.js');

function generateClientId(){
    return new Promise((resolve, reject) => {
        let receivedClientId = null;
        request('https://soundcloud.com', {method: 'GET', responseType: 'string'}).then(async page => {
            const scripts = page.data.split(/<script *(?:.+?)src=['|"|`]/);
            scripts.shift();
            const urls = [];
            for(let i = 0; i < scripts.length; i++){
                if(!scripts[i].startsWith("https://a-v2")) continue;
                urls.push(scripts[i].split(/['|"|`]/)[0]);
            }
            urls.reverse();
            while(receivedClientId === null && urls.length > 0){
                const scriptUrl = urls[0];
                urls.shift();
                try{
                    let scriptPage = await request(scriptUrl, {method: 'GET', responseType: 'string'});
                    scriptPage = scriptPage.data;
                    if(/[{|,]client_id:['|"|`]/.test(scriptPage)){
                        receivedClientId = scriptPage.split(/[{|,]client_id:['|"|`]/)[1].split(/['|"|`]/)[0];
                        continue;
                    }
                } catch {}
            }
            if(receivedClientId === null){
                return reject(`Unable to get a valid client id`);
            }
            clientId = receivedClientId;
            resolve(receivedClientId);
        }).catch(reject);
    })
}

module.exports = generateClientId;
