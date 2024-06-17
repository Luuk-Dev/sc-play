const { Readable } = require('stream');
const { EventEmitter } = require('events');
const { request } = require('../request/request.js');
const stream = require('../stream.js');

class SoundCloudStream extends EventEmitter{
    constructor(data){
        super();
        this.url = data.url;
        this.stream = new Readable({highWaterMark: data.options.highWaterMark, read(){}});
        this.retryCount = 0;
        this.ready = !data.options.download;
        this.info = data.info;
        this.options = data.options;
        this.downloaded_time = 0;
        this.time = [];
        this.sub_urls = []; 

        if(!data.options.download){
            this.emit('ready');
        } else {
            this.start();
        }
    }
    async retry(){
        let newStream = await stream(this.info, {...this.options, download: false});
        this.url = newStream.url;
        this.download();
    }
    start(){
        request(this.url, {method: 'GET', responseType: 'string'}).then(res => {
            if(res.headers['content-type'].indexOf('url') >= 0){
                let timeInfo = res.data.split('\n');
                for(let i = 0; i < timeInfo.length; i++){
                    let subTimeInfo = timeInfo[i];
                    if(subTimeInfo.startsWith("#EXTINF:")){
                        this.time.push(subTimeInfo.split("#EXTINF:").join(""));
                    } else if(subTimeInfo.startsWith("https://")){
                        this.sub_urls.push(subTimeInfo);
                    } else continue;
                }
                this.simDownload();
            } else {
                this.download();
            }
        }).catch(err => {
            this.emit(`error`, err);
            this.abort();
        });
    }
    download(){
        let chunkCount = 0;
        request(this.url, {method: 'GET', callback: true}).then(async res => {
            if(res.statusCode >= 400 && this.retryCount < 5){
                ++this.retryCount;
                try{
                    await this.retry();
                } catch {}
                return;
            } else if(this.retryCount >= 5){
                this.emit('error', 'Server responded with status code '+res.statusCode);
                this.abort();
                return;
            }
            res.on('data', chunk => {
                this.stream.push(chunk);
                ++chunkCount;
                if(chunkCount >= 3 && this.ready === false){
                    this.ready = true;
                    this.emit('ready');
                }
            });

            res.on('error', err => {
                this.emit('error', err);
                this.abort();
            });

            res.on('end', () => {
                if(this.ready === false){
                    this.ready = true;
                    this.emit('ready');
                }
                this.stream.push(null);
            });
        }).catch(async err => {
            if(this.retryCount < 5){
                ++this.retryCount;
                try{
                    await this.retry();
                } catch {}
            } else {
                this.emit('error', err); 
                this.abort();
            }
        });
    }
    simDownload(){
        if(this.time.length === 0 || this.sub_urls.length === 0){
            this.stream.push(null);
            return;
        }

        request(this.sub_urls[0], {method: 'GET', callback: true}).then(res => {
            res.on('data', chunk => {
                this.stream.push(chunk);
            });

            res.on('error', err => {
                this.emit('error', err);
                this.abort();
            });

            res.on('end', () => {
                this.downloaded_time += this.time[0];
                this.sub_urls.shift();
                this.time.shift();
                this.simDownload();
                if(this.ready === false){
                    this.ready = true;
                    this.emit('ready');
                }
            });
        }).catch(err => {
            this.emit('error', err);
            this.abort();
        })
    }
    abort(){
        this.stream.push(null);
        this.time = [];
        this.sub_urls = [];
    }
}

module.exports = SoundCloudStream;
