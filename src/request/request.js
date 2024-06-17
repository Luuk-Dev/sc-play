const https = require('https');
const http = require('http');
const reqTypes = {https: https, http: http};
const { URL } = require('url');
const { validateURL } = require('../util.js');
const userAgents = require('./useragents.json');

function request(url, options){
    return new Promise((resolve, reject) => {
        if(typeof url !== 'string') return reject(`URL is expected to be type of string, received ${typeof url}`);
        const parsed = validateURL(url);
        if(!parsed) return reject(`URL is an invalid URL`);
        const protocolType = parsed.protocol.split(':')[0].toLowerCase();
        const reqType = reqTypes[protocolType];

        if(typeof options !== 'object' || Array.isArray(options) || options === null) options = {method: 'GET', responseType: 'json', headers: {}};

        const methods = ['GET', 'PUT', 'DELETE', 'PATCH'];
        if(methods.indexOf((options.method ?? 'GET').toUpperCase()) < 0) options.method = 'GET';

        const randUserAgent = userAgents[Math.round(Math.random() * (userAgents.length - 1))];

        const req = reqType.request({
            host: parsed.hostname,
            path: parsed.pathname + parsed.search,
            method: options.method,
            headers: {
                ...(options.headers ?? {}),
                'User-Agent': randUserAgent
            }
        }, async res => {
            if(options.callback){
                return resolve(res);
            }
            if(res.statusCode >= 300 || res.statusCode < 200){
                if(res.statusCode >= 300 && res.statusCode < 400){
                    try{
                        let _res = await request(res.headers.location, options);
                        resolve(_res);
                        return;
                    } catch (err){
                        reject(err);
                        return;
                    }
                } else if(res.statusCode >= 400 || res.statusCode < 200){
                    return reject(`Error while receiving SoundCloud information, server responded with status code: ${res.statusCode}`);
                }
            }

            let chunks = [];

            res.on('data', chunk => {
                chunks.push(chunk);
            });

            res.on('error', err => {
                reject(err);
            });

            res.on('end', () => {
                let response = Buffer.concat(chunks);
                let data;

                switch(options.responseType ?? 'json'){
                    case 'json':
                        try{
                            let jsonRes = JSON.parse(response.toString('utf-8'));
                            data = jsonRes;
                        } catch {
                            data = {};
                        }
                        break;
                    case 'arraybuffer':
                        data = response;
                        break;
                    case 'string':
                        data = response.toString('utf-8');
                        break;
                    default:
                        try{
                            let jsonRes = JSON.parse(response.toString('utf-8'));
                            data = jsonRes;
                        } catch {
                            data = {};
                        }
                        break;
                }

                resolve({data: data, headers: res.headers});
            });
        });

        if(typeof options.body === 'string'){
            req.write(options.body);
        }

        req.on('error', err => {
            reject(err);
            return;
        });

        req.end();
    });
}

module.exports = { request };
