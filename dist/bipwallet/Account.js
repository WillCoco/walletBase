"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var bitcoin = require('bitcoinjs-lib');
var Account = /** @class */ (function () {
    function Account(index, name, bip32, network) {
        this._i = bip32;
        this.name = name;
        this.index = index;
        this.network = network;
    }
    Object.defineProperty(Account.prototype, "privateKey", {
        get: function () {
            return this._i.privateKey;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Account.prototype, "hexPrivateKey", {
        get: function () {
            return this._i.privateKey.toString('hex');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Account.prototype, "base58PrivateKey", {
        get: function () {
            return this._i.toBase58();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Account.prototype, "publicKey", {
        get: function () {
            return this._i.publicKey;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Account.prototype, "address", {
        get: function () {
            var publicKeyBuffer = this.publicKey;
            var address = bitcoin.payments.p2pkh({ pubkey: publicKeyBuffer, network: this.network }).address;
            return address;
        },
        enumerable: true,
        configurable: true
    });
    Account.prototype.sign = function (message) {
        return this._i.sign(message);
    };
    return Account;
}());
exports.default = Account;
//# sourceMappingURL=Account.js.map