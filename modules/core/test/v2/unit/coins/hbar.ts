import { Hbar } from '../../../../src/v2/coins/';
import * as accountLib from '@bitgo/account-lib';

import { TestBitGo } from '../../../lib/test_bitgo';

describe('Hedera Hashgraph:', function() {
  let bitgo;
  let basecoin;

  before(function() {
    bitgo = new TestBitGo({ env: 'mock' });
    bitgo.initializeTestVars();
    basecoin = bitgo.coin('thbar');
  });

  it('should instantiate the coin', function() {
    const basecoin = bitgo.coin('hbar');
    basecoin.should.be.an.instanceof(Hbar);
  });

  it('should check valid addresses', async function () {
    const badAddresses = ['', '0.0', 'YZ09fd-', '0.0.0.a', 'sadasdfggg', '0.2.a.b'];
    const goodAddresses = ['0', '0.0.0', '0.0.41098'];

    badAddresses.map(addr => { basecoin.isValidAddress(addr).should.equal(false); });
    goodAddresses.map(addr => { basecoin.isValidAddress(addr).should.equal(true); });
  });

  describe('Keypairs:', () => {
    it('should generate a keypair from random seed', function() {
      const keyPair = basecoin.generateKeyPair();
      keyPair.should.have.property('pub');
      keyPair.should.have.property('prv');

      // TODO: add back when validation of the pub is live
      // basecoin.isValidPub(keyPair.pub).should.equal(true);
    });

    it('should generate a keypair from a seed', function() {
      const seedText = '80350b4208d381fbfe2276a326603049fe500731c46d3c9936b5ce036b51377f';
      const seed = Buffer.from(seedText, 'hex');
      const keyPair = basecoin.generateKeyPair(seed);

      keyPair.prv.should.equal('302e020100300506032b65700422042080350b4208d381fbfe2276a326603049fe500731c46d3c9936b5ce036b51377f');
      keyPair.pub.should.equal('302a300506032b65700321009cc402b5c75214269c2826e3c6119377cab6c367601338661c87a4e07c6e0333');
    });
  });

  describe('Sign transaction:', () => {
    /**
     * Build an unsigned account-lib multi-signature send transaction
     * @param destination The destination address of the transaction
     * @param source The account sending thist ransaction
     * @param amount The amount to send to the recipient
     */
    const buildUnsignedTransaction = async function({
                                                      destination,
                                                      source,
                                                      amount = '100000',
                                                    }) {

      const factory = accountLib.register('thbar', accountLib.Hbar.TransactionBuilderFactory);
      const txBuilder = factory.getTransferBuilder();
      txBuilder.fee({
        fee: '100000',
      });
      txBuilder.source({ address: source });
      txBuilder.to(destination);
      txBuilder.amount(amount);

      return await txBuilder.build();
    };

    it('should sign transaction', async function() {
      const key = new accountLib.Hbar.KeyPair();
      const destination = '0.0.129369';
      const source = '0.0.1234';
      const amount = '100000';

      const unsignedTransaction = await buildUnsignedTransaction({
        destination,
        source,
        amount,
      });

      const tx = await basecoin.signTransaction({
        prv: key.getKeys().prv!.toString(),
        txPrebuild: {
          txHex: unsignedTransaction.toBroadcastFormat(),
        },
      });

      const factory = accountLib.register('thbar', accountLib.Hbar.TransactionBuilderFactory);
      const txBuilder = factory.from(tx.halfSigned.txHex);
      const signedTx = await txBuilder.build();
      const txJson = signedTx.toJson();
      txJson.to.should.equal(destination);
      txJson.from.should.equal(source);
      txJson.amount.should.equal(amount);
      signedTx.signature.length.should.equal(1);
    });
  });
});
