"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var Account_1 = __importDefault(require("./Account"));
// BTY HDWallet派生新账户时需要用到的常量
var PURPOSE = 0x8000002C;
var HIGHEST_BIT = 0x80000000;
/**
 * @description BTY hierarchical deterministic wallets (or "HD Wallets")
 * @export
 * @class HDWallet
 */
var HDWallet = /** @class */ (function () {
    /**
     *Creates an instance of HDWallet.
     * @param {number} coinType 货币类型，根据bip44填BTY对应的值
     * @param {*} seed bip39生成的钱包种子
     * @param {*} masterKey bip32通过seed 生成的BIP32对象
     * @memberof HDWallet
     */
    function HDWallet(coinType, seed, masterKey) {
        this.coinType = coinType;
        this.rootSeed = seed,
            this.masterKey = masterKey;
        this.accountMap = {};
    }
    /**
     * @description 生成一个新的账户，index 为目前列表中最大的index+1
     * @returns {Account}
     * @memberof HDWallet
     */
    HDWallet.prototype.newAccount = function (name, network) {
        var keys = Object.keys(this.accountMap);
        var maxKey = -1;
        for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
            var key = keys_1[_i];
            maxKey = +key > maxKey ? +key : maxKey;
        }
        return this.genAccount(++maxKey, name, network);
    };
    HDWallet.prototype.recoverAccount = function (accountInfos) {
        for (var _i = 0, accountInfos_1 = accountInfos; _i < accountInfos_1.length; _i++) {
            var info = accountInfos_1[_i];
            this.genAccount(info.index, info.name);
        }
    };
    /**
     * @description 根据index生成一个账户
     * @param {number} index
     * @returns {Account}
     * @memberof HDWallet
     */
    HDWallet.prototype.genAccount = function (index, name, network) {
        if (this.accountMap.hasOwnProperty(index)) {
            return this.accountMap["" + index];
        }
        for (var key in this.accountMap) {
            if (this.accountMap[key].name === name) {
                return false;
            }
        }
        var child = this.newKeyFromMasterKey(index);
        var account = new Account_1.default(index, name, child, network);
        this.accountMap["" + index] = account;
        return account;
    };
    /**
     * @description 根据index 删除accountMap中的一个账户
     * @param {number} index
     * @memberof HDWallet
     */
    HDWallet.prototype.deleteAccount = function (index) {
        if (this.accountMap.hasOwnProperty(index)) {
            delete this.accountMap["" + index];
        }
    };
    Object.defineProperty(HDWallet.prototype, "accountIndexList", {
        get: function () {
            var list = [];
            for (var key in this.accountMap) {
                list.push({ index: +key, name: this.accountMap["" + key].name });
            }
            return list;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * @description 生成一个钱包的比特元账户 参考https://gitlab.33.cn/wallet/walletapi/blob/develop/bipwallet/bip44/bip44.go
     * @private
     * @param {number} index
     * @returns {BIP32}
     * @memberof HDWallet
     */
    HDWallet.prototype.newKeyFromMasterKey = function (index) {
        var child = this.masterKey.derive(PURPOSE);
        child = child.derive(this.coinType);
        child = child.derive(HIGHEST_BIT);
        child = child.derive(0);
        child = child.derive(index);
        return child;
    };
    return HDWallet;
}());
exports.default = HDWallet;
//# sourceMappingURL=HDWallet.js.map