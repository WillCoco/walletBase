"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var protobufjs_1 = __importDefault(require("protobufjs"));
var js_sha256_1 = require("js-sha256");
var bitcoinjs_lib_1 = __importDefault(require("bitcoinjs-lib"));
var transaction_json_1 = __importDefault(require("./transaction.json"));
var bip66 = require('bip66');
var root = protobufjs_1.default.Root.fromJSON(transaction_json_1.default);
var Transaction = root.lookupType('Transaction');
var Transactions = root.lookupType('Transactions');
function signTxData(txData, account) {
    txData.signature = null;
    var data = Transaction.encode(txData).finish();
    // hash transaction
    var hash = js_sha256_1.sha256(data);
    var keypair = account;
    // if account is a hex string
    if (typeof account === 'string') {
        var privateKey = fromHexString(account);
        // transform account to keypair
        keypair = bitcoinjs_lib_1.default.ECPair.fromPrivateKey(privateKey);
        // if account is a Account object
    }
    // sign
    var signature = keypair.sign(Buffer.from(fromHexString(hash)));
    // 签名返回长度为64的buffer (r, s)，前32位为r，后32位为s
    var r = signature.slice(0, 32);
    var s = signature.slice(32, 64);
    // Negative numbers are not allowed for R.
    // 128 === 0x80
    if (r[0] & 0x80) {
        // if r is negative unshift 0 before r
        r = Buffer.concat([new Buffer([0]), r]);
    }
    // if s is negative unshift 0 before s
    if (s[0] & 0x80) {
        s = Buffer.concat([new Buffer([0]), s]);
    }
    // console.log('r: ' + r.toString('hex'))
    // console.log('s: ' + s.toString('hex'))
    // DER encode
    // https://github.com/bitcoin/bips/blob/master/bip-0066.mediawiki
    // Format: 0x30 [total-length] 0x02 [R-length] [R] 0x02 [S-length] [S] [sighash]
    signature = bip66.encode(r, s);
    // console.log(signature)
    // console.log(signature.toString('hex'))
    // put signature into transaction
    txData.signature = {
        ty: 1,
        pubkey: keypair.publicKey,
        signature: signature,
    };
    return txData;
}
/**
 * 设置transaction或transactions的过期时间
 * @param transObj
 * @param expireScd
 */
function setExpire(transObj, expireScd) {
    var expireDtStamp = (Date.now() / 1000 + expireScd);
    if (typeof (global) == "object") {
        transObj["expire"] = Math.floor(expireDtStamp);
    }
    else {
        if (transObj["expire"] && transObj["expire"].low) {
            transObj["expire"].low += expireScd;
        }
        else {
            transObj["expire"] = {
                low: Math.floor(expireDtStamp),
                high: 0,
                unsign: false
            };
        }
    }
}
/**
 * 重设tx的过期时间(不能是nobalance交易，必须是叶子交易)
 * @param tx
 * @param expireScd
 */
function resetTxExpire(tx, expireScd) {
    var buffer = fromHexString(tx);
    var message = Transaction.decode(buffer);
    var txdata = Transaction.toObject(message);
    if (expireScd) {
        setExpire(txdata, expireScd);
    }
    else {
        setExpire(txdata, 120);
    }
    // encode transaction
    message = Transaction.fromObject(txdata);
    var txBuffer = Transaction.encode(message).finish();
    var txHexString = Buffer.from(txBuffer).toString('hex');
    return txHexString;
}
exports.resetTxExpire = resetTxExpire;
/**
 * 单个签名
 * @param tx
 * @param account
 * @param expireScd
 */
function signRawTransaction(tx, account, expireScd) {
    // decode transaction string
    var buffer = fromHexString(tx);
    var message = Transaction.decode(buffer);
    var txdata = Transaction.toObject(message);
    if (expireScd) {
        setExpire(txdata, expireScd);
    }
    else {
        setExpire(txdata, 120);
    }
    //private key
    var signedTxData = signTxData(txdata, account);
    // encode transaction
    message = Transaction.fromObject(signedTxData);
    var signedTxBuffer = Transaction.encode(message).finish();
    var signedTxHexString = Buffer.from(signedTxBuffer).toString('hex');
    // return encoded transaction hex string
    return signedTxHexString;
}
exports.signRawTransaction = signRawTransaction;
function fromHexString(hexString) {
    var hexString2 = hexString.replace(/^(0x|0X)/, '');
    var matchResult = hexString2.match(/.{2}/g);
    if (!matchResult) {
        throw new Error('hexString format error: ' + hexString);
    }
    return Buffer.from(new Uint8Array(matchResult.map(function (byte) { return parseInt(byte, 16); })));
}
/**
 * 交易组签名
 * @param tx
 * @param account
 * @param expireScd
 */
function signGroupTransaction(tx, account, expireScd) {
    return signGroupTransaction_ByWithhold(tx, account, "");
}
exports.signGroupTransaction = signGroupTransaction;
/**
 * 代扣交易组签名
 * @param tx
 * @param account
 * @param payAccount
 * @param expireScd
 */
function signGroupTransaction_ByWithhold(tx, account, payAccount, expireScd) {
    var txBuffer = fromHexString(tx);
    // let txData = protobufDecode(Transaction, txBuffer)
    var message = Transaction.decode(txBuffer);
    var txdata = Transaction.toObject(message);
    message = Transactions.decode(txdata.header);
    var txsData = Transactions.toObject(message);
    var newAccs = [];
    if (payAccount) {
        newAccs.push(payAccount);
    }
    for (var i = newAccs.length; i < txsData.txs.length; i++) {
        newAccs.push(account);
    }
    return signGroupTransaction_ByAccounts(tx, newAccs, expireScd);
}
exports.signGroupTransaction_ByWithhold = signGroupTransaction_ByWithhold;
/**
 * 使用账户组对交易组进行签名
 * @param tx
 * @param accounts
 * @param expireScd
 */
function signGroupTransaction_ByAccounts(tx, accounts, expireScd) {
    var txBuffer = fromHexString(tx);
    // let txData = protobufDecode(Transaction, txBuffer)
    var message = Transaction.decode(txBuffer);
    var txdata = Transaction.toObject(message);
    message = Transactions.decode(txdata.header);
    var txsData = Transactions.toObject(message);
    //private key
    var arr = [];
    var i = 0;
    for (var _i = 0, _a = txsData.txs; _i < _a.length; _i++) {
        var txItem = _a[_i];
        var signedTxData = null;
        signedTxData = signTxData(txItem, accounts[i]);
        arr.push(signedTxData);
        i++;
    }
    txsData.txs = arr;
    var copyHeadTxData = arr.slice(0, 1)[0];
    message = Transactions.fromObject(txsData);
    var txsBuffer = Transactions.encode(message).finish();
    copyHeadTxData.header = txsBuffer;
    message = Transaction.fromObject(copyHeadTxData);
    var buffer = Transaction.encode(message).finish();
    return Buffer.from(buffer).toString('hex');
}
exports.signGroupTransaction_ByAccounts = signGroupTransaction_ByAccounts;
//# sourceMappingURL=sign.js.map