const crypto = require('crypto-browserify');
const { v4: uuidv4 } = require('uuid');

const saltify = function(input, salt) {
    return `${ salt }|${ input }|${ salt }|${ input }|${ salt }|${ input }|${ salt }`;
}

const getRandomString = function(length) {
    const temp = crypto.randomBytes(length * 2).toString('hex');

    return temp.substring(0, length); 
}

const getUUID = function() {
    return uuidv4().replace(/-/g, "");
}

const hash = function(input, salt = getRandomString(64)) {    
    const hasher = crypto.createHash("sha256");

    hasher.update(saltify(input, salt));
    
    return {
        hash: hasher.digest('hex').toString(),
        salt
    };
}

const verifyHash = function(input, salt, hsh) {
    const data = hash(input, salt);
    
    return hsh === data.hash;
}

module.exports = {
    getRandomString,
    getUUID,
    hash,
    verifyHash
}