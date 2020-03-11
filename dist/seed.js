"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var HDWallet_1 = __importDefault(require("./bipwallet/HDWallet"));
var bip44Constants = require('bip44-constants');
var bip32 = require('./bipwallet/bip32');
var bip39 = require('./bipwallet/bip39');
// seed
// lumber omit coach hood decorate review machine drive wool knee select awkward hero axis private
// 获得新的助记词 lang = 0 英文 lang = 1 中文
// bitsize = [128, 256] bitsize%32=0
// BTY use 160 as default(15)
function newMnemonic(lang, bitsize) {
    if (lang === void 0) { lang = 1; }
    if (bitsize === void 0) { bitsize = 160; }
    return bip39.generateMnemonic(bitsize, null, [bip39.wordlists.EN, bip39.wordlists.CN][lang]);
}
exports.newMnemonic = newMnemonic;
function newMnemonicInCN() {
    return newMnemonic(1, 160);
}
exports.newMnemonicInCN = newMnemonicInCN;
function newMnemonicInEN() {
    return newMnemonic(0, 160);
}
exports.newMnemonicInEN = newMnemonicInEN;
// 从助记词创建钱包 创建之前应该先验证助记词
function newWalletFromMnemonic(mnemonic, coinType) {
    if (coinType === void 0) { coinType = bip44Constants['BTY']; }
    // get seed with no password
    var seed = bip39.mnemonicToSeed(mnemonic, '');
    var masterKey = bip32.fromSeed(seed);
    return new HDWallet_1.default(coinType, seed, masterKey);
}
exports.newWalletFromMnemonic = newWalletFromMnemonic;
// 检验中文助记词
function validateMnemonicInCN(mnemonic) {
    return bip39.validateMnemonic(mnemonic, bip39.wordlists.CN);
}
exports.validateMnemonicInCN = validateMnemonicInCN;
// 检验英文助记词
function validateMnemonicInEN(mnemonic) {
    return bip39.validateMnemonic(mnemonic, bip39.wordlists.EN);
}
exports.validateMnemonicInEN = validateMnemonicInEN;
//# sourceMappingURL=seed.js.map