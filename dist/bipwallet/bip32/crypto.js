"use strict";
var createHash = require('create-hash');
var createHmac = require('create-hmac');
function hash160(buffer) {
    return createHash('rmd160').update(createHash('sha256').update(buffer).digest()).digest();
}
function hmacSHA512(key, data) {
    return createHmac('sha512', key).update(data).digest();
}
module.exports = { hash160: hash160, hmacSHA512: hmacSHA512 };
//# sourceMappingURL=crypto.js.map