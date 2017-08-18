var request = require('supertest-as-promised')('http://localhost:8014/ledger/')
var test = require('ut-run/test')
var config = require('./../lib/appConfig')
var joi = require('joi')
var uuid = require('uuid')
var ILP = require('ilp')
var Packet = require('ilp-packet')

const PAYMENTID1 = uuid.v4()
const P2PPAYMENTID = uuid.v4()
const BASE = 'http://localhost:8014/ledger'
const DEBITACCOUNTNAME = 'Alice' + (new Date()).getTime()
const DEBITACCOUNTBALANCE = '1000.00'
const CREDITACCOUNTNAME = 'Bob' + (new Date()).getTime()
const CREDITACCOUNTBALANCE = '1000.00'
const COMMISSIONACCOUNTNAME = 'commission' + (new Date()).getTime()
const COMMISSIONACCOUNTBALANCE = '0'
const AMOUNT = '50.00'
const FEE = '1.00'
const ZEROFEE = '0.00'
const COMMISSION = '0.50'
const COMMISSIONZERO = '0.00'
const EXECUTEDSTATE = 'executed'
const PREPAREDSTATE = 'prepared'
const FULFILLMENT = 'oAKAAA'
const TRANSFERTYPEP2P = 'p2p'
const TRANSFERTYPEIDP2P = 1
const IDENTIFIERTYPE = 'eur'

const creditMemo1 = JSON.stringify(JSON.stringify({
  'fee': 1,
  'transferCode': 'p2p',
  'debitName': 'alice alice',
  'creditName': 'agent agent',
  'debitIdentifier': 'alice'
}))
const creditMemo1Encoded = Packet.serializeIlpPayment({
  account: DEBITACCOUNTNAME,
  amount: AMOUNT,
  data: ILP.PSK.createDetails({
    publicHeaders: { 'Payment-Id': PAYMENTID1 },
    headers: {
      'Content-Length': creditMemo1.length,
      'Content-Type': 'application/json',
      'Sender-Identifier': 123
    },
    disableEncryption: true,
    data: Buffer.from(creditMemo1)
  })
}).toString('base64')

const CREDIT_QUOTE = {
  paymentId: P2PPAYMENTID,
  identifier: 'alice',
  identifierType: 'eur',
  destinationAccount: BASE + '/alice',
  currency: 'TZS',
  amount: AMOUNT,
  fee: ZEROFEE,
  commission: COMMISSIONZERO,
  transferType: TRANSFERTYPEP2P,
  params: {
    peer: {
      identifier: 'bob',
      identifierType: 'eur'
    }
  },
  isDebit: false
}

const DEBIT_QUOTE = {
  paymentId: P2PPAYMENTID,
  identifier: 'bob',
  identifierType: 'eur',
  destinationAccount: BASE + '/alice',
  currency: 'TZS',
  amount: AMOUNT,
  fee: FEE,
  commission: COMMISSION,
  transferType: TRANSFERTYPEP2P,
  isDebit: true,
  params: {
    peer: {
      identifier: 'alice',
      identifierType: 'eur'
    }
  }
}

test({
  type: 'integration',
  name: 'DFSP transfer test',
  server: config.server,
  serverConfig: config.serverConfig,
  client: config.client,
  clientConfig: config.clientConfig,
  steps: function (test, bus, run) {
    return run(test, bus, [{
      name: 'Get server meta',
      params: (context) => {
        return request
          .get('')
          .expect('Content-Type', /json/)
          .expect(200)
      },
      result: (result, assert) => {
        assert.equals(joi.validate(result.body, joi.object().keys({
          currency_code: joi.string().allow([null, '']),
          currency_symbol: joi.string().allow([null, '']),
          // condition_sign_public_key: joi.string().allow([null, '']),
          // notification_sign_public_key: joi.string().allow([null, '']),
          connectors: joi.array().items(joi.object().keys({
            id: joi.string(),
            name: joi.string()
          })),
          urls: joi.object({
            health: joi.string(),
            transfer: joi.string(),
            transfer_fulfillment: joi.string(),
            transfer_rejection: joi.string(),
            // transfer_state: joi.string(),
            accounts: joi.string(),
            account: joi.string(),
            auth_token: joi.string(),
            // account_transfers: joi.string(),
            // subscription: joi.string(),
            websocket: joi.string(),
            message: joi.string()
          }),
          precision: joi.number().integer(),
          scale: joi.number().integer()
        })).error, null, 'return server meta')
      }
    }, {
      name: 'Create first ledger account',
      params: (context) => {
        return request
          .put('accounts')
          .send({
            'name': DEBITACCOUNTNAME,
            'balance': DEBITACCOUNTBALANCE
          })
          .expect('Content-Type', /json/)
          .expect(200)
      },
      result: (result, assert) => {
        assert.equals(joi.validate(result.body, joi.object().keys({
          id: joi.string(),
          accountNumber: joi.string(),
          name: joi.string(),
          balance: joi.string(),
          currency: joi.string(),
          is_disabled: joi.bool()
        })).error, null, 'return ledger account details')
      }
    }, {
      name: 'Create second ledger account',
      params: (context) => {
        return request
          .put('accounts')
          .send({
            'name': CREDITACCOUNTNAME,
            'balance': CREDITACCOUNTBALANCE
          })
          .expect('Content-Type', /json/)
          .expect(200)
      },
      result: (result, assert) => {
        assert.equals(joi.validate(result.body, joi.object().keys({
          id: joi.string(),
          accountNumber: joi.string(),
          name: joi.string(),
          balance: joi.string(),
          currency: joi.string(),
          is_disabled: joi.any()
        })).error, null, 'return ledger account details')
      }
    }, {
      name: 'Create commission account',
      method: 'ledger.account.add',
      params: (context) => {
        return {
          'name': COMMISSIONACCOUNTNAME,
          'balance': COMMISSIONACCOUNTBALANCE,
          'parentAccountNumber': context['Create second ledger account'].body.accountNumber,
          'accountTypeId': 5
        }
      },
      result: (result, assert) => {
        assert.equals(joi.validate(result.body, joi.object().keys({
          id: joi.string(),
          accountNumber: joi.string(),
          name: joi.string(),
          balance: joi.string(),
          currency: joi.string(),
          is_disabled: joi.any()
        })).error, null, 'return commission account details')
      }
    }, {
      name: 'Get ledger account',
      params: (context) => {
        return request
          .get('accounts/' + context['Create first ledger account'].body.accountNumber)
          .expect('Content-Type', /json/)
          .expect(200)
      },
      result: (result, assert) => {
        assert.equals(joi.validate(result.body, joi.object().keys({
          id: joi.string(),
          name: joi.string(),
          accountType: joi.string(),
          balance: joi.string(),
          currencySymbol: joi.string(),
          currencyCode: joi.string(),
          ledger: joi.string(),
          is_disabled: joi.any()
        })).error, null, 'return ledger account details')
      }
    }, {
      name: 'Quote add - debit account',
      method: 'ledger.quote.add',
      params: (context) => {
        return DEBIT_QUOTE
      },
      result: (result, assert) => {
        assert.equals(joi.validate(result, joi.object().keys({
          amount: joi.string().required().valid(AMOUNT),
          commission: joi.string().required().valid(COMMISSION),
          fee: joi.number().required().valid(Number(FEE)),
          currencyId: joi.string().required().valid('TZS'),
          destinationAccount: joi.string().required().valid(BASE + '/alice'),
          expiresAt: joi.string().required(),
          identifier: joi.string().required().valid('bob'),
          identifierType: joi.string().required().valid(IDENTIFIERTYPE),
          isDebit: joi.boolean().required().valid(true),
          quoteId: joi.number().required(),
          transferTypeId: joi.number().required().valid(TRANSFERTYPEIDP2P),
          paymentId: joi.string().required().regex(/^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/),
          receiver: joi.string().required().allow(null),
          ipr: joi.string().required().allow(null),
          sourceExpiryDuration: joi.string().required().allow(null),
          connectorAccount: joi.string().required().allow(null),
          params: joi.object().allow(null)
        })).error, null, 'return debit quote details')
      }
    }, {
      name: 'Transfer hold expired',
      params: (context) => {
        return request
          .put('transfers/' + P2PPAYMENTID)
          .send({
            'id': BASE + '/transfers/' + P2PPAYMENTID,
            'ledger': BASE,
            'debits': [{
              'account': BASE + '/accounts/' + context['Create first ledger account'].body.accountNumber,
              'amount': AMOUNT,
              'memo': {},
              'authorized': true
            }],
            'credits': [{
              'account': BASE + '/accounts/' + context['Create second ledger account'].body.accountNumber,
              'memo': {
                ilp: creditMemo1Encoded
              },
              'amount': AMOUNT
            }],
            'execution_condition': 'ni:///sha-256;47DEQpj8HBSa-_TImW-5JCeuQeRkm5NMpJWZG3hSuFU?fpt=preimage-sha-256&cost=0',
            'expires_at': new Date((new Date()).getTime() - 10 * 60000)
          })
      },
      result: (result, assert) => {
        assert.equals(result.error.status, 400)
        assert.equals(joi.validate(result.body, joi.object().keys({
          id: joi.string().valid('TransferExpired').required(),
          message: joi.string().required(),
          type: joi.string().required()
        })).error, null, 'return transfer expired error')
      }
    }, {
      name: 'Transfer hold',
      params: (context) => {
        return request
          .put('transfers/' + P2PPAYMENTID)
          .send({
            'id': BASE + '/transfers/' + P2PPAYMENTID,
            'ledger': BASE,
            'debits': [{
              'account': BASE + '/accounts/' + context['Create first ledger account'].body.accountNumber,
              'amount': AMOUNT,
              'memo': {},
              'authorized': true
            }],
            'credits': [{
              'account': BASE + '/accounts/' + context['Create second ledger account'].body.accountNumber,
              'memo': {
                ilp: creditMemo1Encoded,
                quote: CREDIT_QUOTE
              },
              'amount': AMOUNT
            }],
            'execution_condition': 'ni:///sha-256;47DEQpj8HBSa-_TImW-5JCeuQeRkm5NMpJWZG3hSuFU?fpt=preimage-sha-256&cost=0',
            'expires_at': new Date((new Date()).getTime() + 10 * 60000)
          })
          .expect('Content-Type', /json/)
          .expect(201)
      },
      result: (result, assert) => {
        assert.equals(joi.validate(result.body, joi.object().keys({
          id: joi.string().required(),
          ledger: joi.string().required(),
          debits: joi.array().items(joi.object().keys({
            account: joi.string().required(),
            memo: joi.object().optional(),
            amount: joi.string().valid(AMOUNT).required(),
            authorized: joi.boolean()
          })).required(),
          credits: joi.array().items(joi.object().keys({
            account: joi.string().required(),
            memo: joi.object().optional(),
            amount: joi.string().valid(AMOUNT).required()
          })).required(),
          execution_condition: joi.string().required().allow(null),
          cancellation_condition: joi.string().required().allow(null),
          state: joi.string().required().valid(PREPAREDSTATE),
          expires_at: joi.string().required()
        })).error, null, 'return transfer hold details')
      }
    }, {
      name: 'Execute Prepared Transfer',
      params: (context) => {
        return request
          .put('transfers/' + P2PPAYMENTID + '/fulfillment')
          .set('Content-type', 'text/plain')
          .send(FULFILLMENT)
          .expect('Content-Type', 'text/plain; charset=utf-8')
          .expect(200)
      },
      result: (result, assert) => {
        assert.equals(result.text, FULFILLMENT, 'return fulfillment')
      }
    }, {
      name: 'Get Transfer Fulfillment',
      params: (context) => {
        return request
          .get('transfers/' + P2PPAYMENTID + '/fulfillment')
          .expect('Content-Type', 'text/plain; charset=utf-8')
          .expect(200)
      },
      result: (result, assert) => {
        assert.equals(result.text, FULFILLMENT, 'return fulfillment')
      }
    }, {
      name: 'Get Transfer by ID',
      params: (context) => {
        return request
          .get('transfers/' + P2PPAYMENTID)
          .expect('Content-Type', /json/)
          .expect(200)
      },
      result: (result, assert) => {
        assert.equals(joi.validate(result.body, joi.object().keys({
          id: joi.string().required(),
          ledger: joi.string().required(),
          debits: joi.array().items(joi.object().keys({
            account: joi.string().required(),
            memo: joi.any().required(),
            amount: joi.string().valid(AMOUNT).required()
          })).required(),
          credits: joi.array().items(joi.object().keys({
            account: joi.string().required(),
            memo: joi.any().required(),
            amount: joi.string().valid(AMOUNT).required()
          })).required(),
          execution_condition: joi.string().required().allow(null),
          cancellation_condition: joi.string().required().allow(null),
          expires_at: joi.string().required(),
          state: joi.string().required().valid(EXECUTEDSTATE),
          timeline: joi.object().keys({
            proposed_at: joi.string().required(),
            prepared_at: joi.string().required(),
            executed_at: joi.string().required()
          })
        })).error, null, 'return transfer by id details')
      }
    }])
  }
}, module.parent)
