//
// Tests for Wallet
//
// Copyright 2014, BitGo, Inc.  All Rights Reserved.
//

var assert = require('assert');
var should = require('should');

var BitGoJS = require('../../src/index');
var TestBitGo = require('../lib/test_bitgo');

var TEST_ADDRESS1 = '0x8ce4949d8a16542d423c17984e6739fa72ceb177';
var TEST_MANYTRANSACTIONSADDRESS = '0x8ce4949d8a16542d423c17984e6739fa72ceb177';

var TEST_TRANSACTION = '0xc0c1c720bc5b3583ad3a4075730b44c0c120a0fe660e51817f8c857bf37dbec0';

var TEST_BLOCK = '0xbee4330cdd56d2bcc47fa42e52e3c089c649b209acc0ae5611f6c7bc7c0b350e';

// TODO: WORK IN PROGRESS
describe('Ethereum Blockchain API:', function() {
  var bitgo;
  var blockchain;

  before(function(done) {
    BitGoJS.setNetwork('testnet');

    bitgo = new TestBitGo();
    bitgo.initializeTestVars();
    blockchain = bitgo.eth().blockchain();
    done();
  });

  describe('Get Address', function() {
    it('arguments', function(done) {
      assert.throws(function() {
        blockchain.getAddress('invalid', function() {
        });
      });
      assert.throws(function() {
        blockchain.getAddress({});
      });
      done();
    });

    it('get', function(done) {
      blockchain.getAddress({ address: TEST_ADDRESS1 }, function(err, address) {
        assert.equal(err, null);
        address.should.have.property('address');
        address.should.have.property('balance');
        address.should.have.property('sent');
        address.should.have.property('received');
        done();
      });
    });
  });

  describe('Get Address Transactions', function() {
    it('arguments', function(done) {
      assert.throws(function() {
        blockchain.getAddressTransactions('invalid', function() {
        });
      });
      assert.throws(function() {
        blockchain.getAddressTransactions({});
      });
      done();
    });

    it('list', function(done) {
      var options = { address: TEST_ADDRESS1 };
      blockchain.getAddressTransactions(options, function(err, result) {
        assert.equal(err, null);
        assert.equal(Array.isArray(result.transactions), true);
        assert.equal(result.start, 0);
        // result.should.have.property('total');
        result.should.have.property('count');
        done();
      });
    });

    it('list_many_transactions', function(done) {
      var options = { address: TEST_MANYTRANSACTIONSADDRESS };
      blockchain.getAddressTransactions(options, function(err, result) {
        assert.equal(err, null);
        assert.equal(Array.isArray(result.transactions), true);
        assert.equal(result.start, 0);
        // result.should.have.property('total');
        result.should.have.property('count');
        assert(result.transactions.length > 3);
        assert.equal(result.transactions.length, result.count);
        // assert(result.total > 75);
        done();
      });
    });
  });

  describe('Get Transaction', function() {
    it('arguments', function(done) {
      assert.throws(function() {
        blockchain.getTransaction('invalid', function() {
        });
      });
      assert.throws(function() {
        blockchain.getTransaction({});
      });
      assert.throws(function() {
        blockchain.getTransaction({}, function() {
        });
      });
      done();
    });

    it('get', function(done) {
      blockchain.getTransaction({ id: TEST_TRANSACTION }, function(err, transaction) {
        assert.equal(err, null);
        transaction.transaction.should.have.property('txHash');
        transaction.transaction.should.have.property('receiveTime');
        transaction.transaction.should.have.property('confirmTime');
        transaction.transaction.should.have.property('entries');
        transaction.transaction.should.have.property('from');
        transaction.transaction.should.have.property('to');
        // for the time being, transaction entries are not necessary for the client
        // assert.equal(Array.isArray(transaction.entries), true);
        // assert.equal(transaction.entries.length, 2);
        // var transactionEntry = transaction.entries[0];
        // transactionEntry.should.have.property('account');
        // transactionEntry.should.have.property('value');
        done();
      });
    });
  });

  describe('Get Block', function() {
    it('arguments', function(done) {
      assert.throws(function() {
        blockchain.getBlock('invalid', function() {
        });
      });
      assert.throws(function() {
        blockchain.getBlock({});
      });
      assert.throws(function() {
        blockchain.getBlock({}, function() {
        });
      });
      done();
    });

    it('get', function(done) {
      blockchain.getBlock({ id: TEST_BLOCK }, function(err, block) {
        assert.equal(err, null);
        block.should.have.property('height');
        block.should.have.property('createTime');
        block.should.have.property('parentHash');
        block.should.have.property('transactions');
        block.height.should.equal(46239);
        block.parentHash.should.equal('0x43df14fa812e4862a13db5330a838b0b112bbbb1c293ff1ce97d13fd6626b389');
        block.transactions.should.include('0xc0c1c720bc5b3583ad3a4075730b44c0c120a0fe660e51817f8c857bf37dbec0');
        done();
      });
    });
  });
});
