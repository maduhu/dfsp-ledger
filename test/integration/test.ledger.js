var seed = (Date.now() - 1463200000000) * 10000 // 1463200000000 is 14 May 2016
function next () {
  seed += 1
  return seed
}

var request = require('supertest-as-promised')('http://localhost:8014/ledger/')
var test = require('ut-run/test')
var config = require('./../lib/appConfig')
var joi = require('joi')
var uuid = require('uuid')
const UUID = uuid.v4()
const BASE = 'http://localhost:8014/ledger'
const DEBITACCOUNTNUMBER = 'alice' + next()
const DEBITACCOUNTNAME = 'Alice'
const DEBITACCOUNTBALANCE = '1000.00'
const DEBITACCOUNT = BASE + '/accounts/' + DEBITACCOUNTNUMBER
const CREDITACCOUNTNUMBER = 'bob' + next()
const CREDITACCOUNTNAME = 'Bob'
const CREDITACCOUNTBALANCE = '1000.00'
const CREDITACCOUNT = BASE + '/accounts/' + CREDITACCOUNTNUMBER
const AMOUNT = '50.00'
const EXECUTEDSTATE = 'executed'
const PREPAREDSTATE = 'prepared'
const FULFILLMENT = 'cf:0:_v8'

test({
  type: 'integration',
  name: 'DFSP transfer test',
  server: config.server,
  serverConfig: config.serverConfig,
  client: config.client,
  clientConfig: config.clientConfig,
  steps: function (test, bus, run) {
    run(test, bus, [{
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
          condition_sign_public_key: joi.string().allow([null, '']),
          notification_sign_public_key: joi.string().allow([null, '']),
          urls: joi.object({
            transfer: joi.string(),
            transfer_fulfillment: joi.string(),
            transfer_state: joi.string(),
            accounts: joi.string(),
            account: joi.string(),
            account_transfers: joi.string(),
            subscription: joi.string()
          }),
          precision: joi.number().integer(),
          scale: joi.number().integer()
        })).error, null, 'return server meta')
      }
    }, {
      name: 'Create first ledger account',
      params: (context) => {
        return request
          .put('accounts/' + DEBITACCOUNTNUMBER)
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
          name: joi.string(),
          balance: joi.string(),
          is_disabled: joi.any()
        })).error, null, 'return ledger account details')
      }
    }, {
      name: 'Create second ledger account',
      params: (context) => {
        return request
          .put('accounts/' + CREDITACCOUNTNUMBER)
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
          name: joi.string(),
          balance: joi.string(),
          is_disabled: joi.any()
        })).error, null, 'return ledger account details')
      }
    }, {
      name: 'Get ledger account',
      params: (context) => {
        return request
          .get('accounts/' + DEBITACCOUNTNUMBER)
          .expect('Content-Type', /json/)
          .expect(200)
      },
      result: (result, assert) => {
        assert.equals(joi.validate(result.body, joi.object().keys({
          id: joi.string(),
          name: joi.string(),
          balance: joi.string(),
          ledger: joi.string(),
          is_disabled: joi.any()
        })).error, null, 'return ledger account details')
      }
    }, {
      name: 'Transfer hold',
      params: (context) => {
        return request
          .put('transfers/' + UUID)
          .send({
            'id': BASE + '/transfers/' + UUID,
            'ledger': BASE,
            'debits': [{
              'account': DEBITACCOUNT,
              'amount': AMOUNT,
              'authorized': true
            }],
            'credits': [{
              'account': CREDITACCOUNT,
              'amount': AMOUNT
            }],
            'execution_condition': 'cc:0:3:8ZdpKBDUV-KX_OnFZTsCWB_5mlCFI3DynX5f5H2dN-Y:2',
            'expires_at': '2015-06-16T00:00:01.000Z'
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
            amount: joi.string().valid(AMOUNT).required()
          })).required(),
          credits: joi.array().items(joi.object().keys({
            account: joi.string().required(),
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
          .put('transfers/' + UUID + '/fulfillment')
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
          .get('transfers/' + UUID + '/fulfillment')
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
          .get('transfers/' + UUID)
          .expect('Content-Type', /json/)
          .expect(200)
      },
      result: (result, assert) => {
        assert.equals(joi.validate(result.body, joi.object().keys({
          id: joi.string().required(),
          ledger: joi.string().required(),
          debits: joi.array().items(joi.object().keys({
            account: joi.string().required(),
            amount: joi.string().valid(AMOUNT).required()
          })).required(),
          credits: joi.array().items(joi.object().keys({
            account: joi.string().required(),
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
