"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var protobufjs_1 = __importDefault(require("protobufjs"));
var js_sha256_1 = __importDefault(require("js-sha256"));
var bitcoinjs_lib_1 = __importDefault(require("bitcoinjs-lib"));
var bip66_1 = __importDefault(require("bip66"));
var transaction_json_1 = __importDefault(require("./transaction.json"));
var root = protobufjs_1.default.Root.fromJSON(transaction_json_1.default);
var Transaction = root.lookupType('Transaction');
var Transactions = root.lookupType('Transactions');
function signRawTx(tx, privateKey) {
    var txData = protobufDecode(Transaction, fromHexString(tx));
    var signedTxData = signTxData(txData, privateKey);
    return Buffer.from(protobufEncode(Transaction, signedTxData)).toString('hex');
}
exports.signRawTx = signRawTx;
function signGroupTx(tx, privateKey) {
    var txBuffer = fromHexString(tx);
    var txData = protobufDecode(Transaction, txBuffer);
    var txsData = protobufDecode(Transactions, txData.header);
    var arr = [];
    for (var _i = 0, _a = txsData.txs; _i < _a.length; _i++) {
        var txItem = _a[_i];
        var signedTxData = signTxData(txItem, privateKey);
        arr.push(signedTxData);
    }
    txsData.txs = arr;
    var copyHeadTxData = arr.slice(0, 1)[0];
    var txsBuffer = protobufEncode(Transactions, txsData);
    copyHeadTxData.header = txsBuffer;
    var buffer = protobufEncode(Transaction, copyHeadTxData);
    return Buffer.from(buffer).toString('hex');
}
exports.signGroupTx = signGroupTx;
function protobufDecode(type, buffer) {
    var msg = type.decode(buffer);
    return type.toObject(msg);
}
function protobufEncode(type, data) {
    var msg = type.fromObject(data);
    return type.encode(msg).finish();
}
function fromHexString(hexString) {
    hexString = hexString.replace(/^(0x|0X)/, '');
    var matchResult = hexString.match(/.{2}/g);
    if (!matchResult) {
        throw new Error('hexString format error: ' + hexString);
    }
    return Buffer.from(new Uint8Array(matchResult.map(function (byte) { return parseInt(byte, 16); })));
}
function signTxData(txData, priKeyStr) {
    txData.signature = null;
    var data = Transaction.encode(txData).finish();
    // hash transaction
    var hash = js_sha256_1.default.sha256(data);
    var keypair = bitcoinjs_lib_1.default.ECPair.fromPrivateKey(fromHexString(priKeyStr));
    // sign
    var signature = keypair.sign(Buffer.from(fromHexString(hash)));
    var r = signature.slice(0, 32);
    var s = signature.slice(32, 64);
    if (r[0] & 0x80) {
        r = Buffer.concat([Buffer.from([0]), r]);
    }
    if (s[0] & 0x80) {
        s = Buffer.concat([Buffer.from([0]), s]);
    }
    signature = bip66_1.default.encode(r, s);
    txData.signature = {
        ty: 1,
        pubkey: keypair.publicKey,
        signature: signature,
    };
    return txData;
}
//# sourceMappingURL=sign2.js.map