# @33cn/wallet-base
提供最基础的创建钱包，交易签名功能
## Installation

```
npm install @33cn/wallet-base --save
```

```
import {seed, sign} from '@33cn/wallet-base'
```

## Dependence
windows 系统下npm install 可能会报错，尝试安装[windows-build-tools](https://github.com/felixrieseberg/windows-build-tools)解决
## Usage
### Create a bityuan HDWallet

```
import {seed} from '@33cn/wallet-base'
// or
// import * as seed from '@33cn/wallet-base/dist/seed'

// Get a mnemonic
const mnemonic = seed.newMnemonicInCN()
console.log(mnemonic)
// log: '站 史 若 核 园 供 唐 谈 伦 悉 对 微 事 咨 晶'

// Create a HDWallet by mnemonic
const wallet = seed.newWalletFromMnemonic(mnemonic)

// Create an account

const account = wallet.newAccount('account1')

```

### Sign transaction

```
import {sign} from '@33cn/wallet-base'
// or
// import * as sign from '@33cn/wallet-base/dist/sign'

const tx = '0a05636f696e73122d18010a291080ade20422223142325465383971743863655a4741504c786565586337384d37557036756531693320a08d0630b0bcb3f0bba2a1bb0d3a223142325465383971743863655a4741504c786565586337384d375570367565316933'

// Sign transaction with account (120s)
const signedTx = await sign.signRawTransaction(tx, account[, 120])

// Or sign transaction with privateKey (120s)
const signedTx1 = await sign.signRawTransaction(tx, 'ce4244f0c709ad0276b7f94d6fb9fb4c643b741c98bcb5335503cc93ed25ade0'[, 120])





// for sign group in browser, you must replace some codes when start the project, example in vue-cli 3.0:
//vue.config.js
var fs = require('fs');
fs.readFile(process.env.INIT_CWD + "/node_modules/protobufjs/src/util/minimal.js", function(error, data){
	if(error){
		console.log('读取文件失败', error)
	}else{
    let data2 = data.toString();
    let matches = data2.match(/util.Long =[^;]*/m)
    let matches2 = data2.match(/var LLong = require\("long"\);util.Long =[^;]* \|\| LLong/m);
    if(matches[0] && (!matches2 || !matches2[0])){
      let newStr = 'var LLong = require("long");' +  matches[0] + " || LLong";
      data2 = data2.replace(/util.Long =[^;]*/mgi, newStr)
      fs.writeFile(process.env.INIT_CWD + "/node_modules/protobufjs/src/util/minimal.js", data2, function(error){
        if(error){
          console.log('修改失败', error)
        } else {
          console.log('修改成功')
        }
      });
    }
    else{
      console.log("已经修改了, 不用重复修改.")
    }
  }
});

//leaf tx change expire;
const newTx = await sign.resetTxExpire(tx, 120);

const signedTx2 = await sign.signGroupTransaction('0a11757365722e702e6c6f616e2e746f6b656e126c38070a680a115943545445535431323334353637383636120859435454455354361a1fe8bf99e698afe69da8e68890e6b69be58f91e79a84e6b58be8af95e5b881362080c8afa025322231335a51316a51536d6663664245507772774d676d4a704a504a6f4e4231644c705520c09a0c3081b8c1f098c598a9383a2231464c5537444e474a4d596563624e32573550397445706966737a364b413852465a40024a98030af9010a11757365722e702e6c6f616e2e746f6b656e126c38070a680a115943545445535431323334353637383636120859435454455354361a1fe8bf99e698afe69da8e68890e6b69be58f91e79a84e6b58be8af95e5b881362080c8afa025322231335a51316a51536d6663664245507772774d676d4a704a504a6f4e4231644c705520c09a0c3081b8c1f098c598a9383a2231464c5537444e474a4d596563624e32573550397445706966737a364b413852465a40024a20301bc57cdd3e8ff2bd0a6bd30dfa42f29f93ec1bcad4807974445da56974058f52201ded76f21f883c2232bc549430166f1a43a7c9070b143f4e011f9d2bb2f821a90a99010a11757365722e702e6c6f616e2e746f6b656e12323808122e0a085943545445535436122231335a51316a51536d6663664245507772774d676d4a704a504a6f4e4231644c705530eae8fce5eea981f6063a2231464c5537444e474a4d596563624e32573550397445706966737a364b413852465a40024a20301bc57cdd3e8ff2bd0a6bd30dfa42f29f93ec1bcad4807974445da56974058f52201ded76f21f883c2232bc549430166f1a43a7c9070b143f4e011f9d2bb2f821a9',
'3990969DF92A5914F7B71EEB9A4E58D6E255F32BF042FEA5318FC8B3D50EE6E8'[, 300])

const signedTx3 = sign.signGroupTransaction_ByWithhold(tx, privkey, payPrivkey[, 300])

//tx contains two trade~
const signedTx3 = sign.signGroupTransaction_ByAccounts(tx, [privkey1, privkey2], 300)

```

## Build
run ```npm run start``` to build your code
## Reference
- [币钱包sdk的go语言代码](https://gitlab.33.cn/wallet/walletapi)，整个项目的实现很大程度上参考了这里
- [bips](https://github.com/bitcoin/bips)
- HDWalle:[bip32](https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki)
- 助记词:[bip39](https://github.com/bitcoinjs/bip39)
- 签名相关:[secp256k1](https://github.com/bitcoinjs/tiny-secp256k1),[bip66](https://github.com/bitcoin/bips/blob/master/bip-0066.mediawiki)
- 交易字符串编码: [protocol buffers](https://developers.google.com/protocol-buffers/docs/proto3), [ProtoBuf.js](https://github.com/dcodeIO/ProtoBuf.js/)
