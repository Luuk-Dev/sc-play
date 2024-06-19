const stream = require('./stream.js');
const getInfo = require('./getInfo.js');
const getClientId = require('./getClientId.js');
const search = require('./search.js');
const { validateSoundCloudURL } = require('./util.js');

module.exports = { stream, getInfo, getClientId, search, validateSoundCloudURL };
