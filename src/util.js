var Util = module.exports;
var bitcoin = require('bitcoinjs-lib');
var ethereumUtil = require('ethereumjs-util');
var Big = require('big.js');
var sha3 = require('keccakjs');

Util.bnToByteArrayUnsigned = function(bn) {
  var ba = bn.abs().toByteArray();
  if (ba.length) {
    if (ba[0] == 0) {
      ba = ba.slice(1);
    }
    return ba.map(function (v) {
      return (v < 0) ? v + 256 : v;
    });
  } else {
    // Empty array, nothing to do
    return ba;
  }
};

Util.p2shMultisigOutputScript = function(m, pubKeys) {
  var redeemScript = bitcoin.script.multisigOutput(2, pubKeys);
  var hash = bitcoin.crypto.hash160(redeemScript);
  return bitcoin.script.scriptHashOutput(hash);
};

// Convert a BTC xpub to an Ethereum address (with 0x) prefix
Util.xpubToEthAddress = function(xpub) {
  var hdNode = bitcoin.HDNode.fromBase58(xpub);
  var ethPublicKey = hdNode.keyPair.__Q.getEncoded(false).slice(1);
  var hash = new sha3(256);
  hash.update(ethPublicKey);
  return '0x' + hash.digest('hex').slice(-40);
};

// Convert a BTC xpriv to an Ethereum private key (without 0x prefix)
Util.xprvToEthPrivateKey = function(xprv) {
  var hdNode = bitcoin.HDNode.fromBase58(xprv);
  var ethPrivateKey = hdNode.keyPair.d.toBuffer();
  return ethPrivateKey.toString('hex');
};

Util.weiToEtherString = function(wei) {
  if (!(wei instanceof ethereumUtil.BN)) {
    throw new Error('wei has to be an instance of BN');
  }
  Big.E_POS = 256;
  Big.E_NEG = -18;
  var weiString = wei.toString(10);
  var big = new Big(weiString);
  // 10^18
  var ether = big.div('1000000000000000000');
  return ether.toPrecision();
};