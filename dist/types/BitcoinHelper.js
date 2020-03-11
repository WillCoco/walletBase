"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var wif = require('wif');
var Buffer = require('safe-buffer').Buffer;
var bitcoin = require('bitcoinjs-lib');
var BitcoinHelper = /** @class */ (function () {
    function BitcoinHelper() {
    }
    BitcoinHelper.keyPairFromHexPrivKey = function (hexPrivKey) {
        var WIFPrivateKey = BitcoinHelper.hexToWif(hexPrivKey);
        var keyPair = bitcoin.ECPair.fromWIF(WIFPrivateKey);
        return keyPair;
    };
    BitcoinHelper.publicKeyFromHexPrivKey = function (hexPrivKey) {
        var hexPublicKey = BitcoinHelper.keyPairFromHexPrivKey(hexPrivKey).publicKey.toString('hex');
        return '0x' + hexPublicKey;
    };
    BitcoinHelper.hexToWif = function (hex) {
        hex = hex.replace(/^0x/, '');
        var privateKey = Buffer.from(hex, 'hex');
        var wifKey = wif.encode(0x80, privateKey, true);
        return wifKey;
    };
    return BitcoinHelper;
}());
exports.default = BitcoinHelper;
//# sourceMappingURL=BitcoinHelper.js.map