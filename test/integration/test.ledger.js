var request = require('supertest-as-promised')('http://localhost:8014/ledger/')
var test = require('ut-run/test')
var config = require('./../lib/appConfig')
var joi = require('joi')
var uuid = require('uuid')
const UUID = uuid.v4()
const BASE = 'http://localhost:8014/ledger'
const DEBITACCOUNTNAME = 'Alice' + (new Date()).getTime()
const DEBITACCOUNTBALANCE = '1000.00'
const CREDITACCOUNTNAME = 'Bob' + (new Date()).getTime()
const CREDITACCOUNTBALANCE = '1000.00'
const AMOUNT = '50.00'
const EXECUTEDSTATE = 'executed'
const PREPAREDSTATE = 'prepared'
const FULFILLMENT = 'oAKAAA'

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
          balance: joi.string(),
          currencySymbol: joi.string(),
          currencyCode: joi.string(),
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
              'account': BASE + '/accounts/' + context['Create first ledger account'].body.accountNumber,
              'amount': AMOUNT,
              'memo': {note: 'debit memo'},
              'authorized': true
            }],
            'credits': [{
              'account': BASE + '/accounts/' + context['Create second ledger account'].body.accountNumber,
              'memo': {ilp: 'AYIBfwAAAAAAAAooNmxldmVsb25lLmRmc3AxLmFsaWNlLkRXcUYtMUFQWVJnTER6NWoteVFRRjd1eTltRXVJMS1td4IBPFBTSy8xLjAKTm9uY2U6IHlwcnhzMjVPMHo1S2szeFBXLTZ2VVEKRW5jcnlwdGlvbjogbm9uZQpQYXltZW50LUlkOiBlOTM3MDRhYy1iNWQ0LTQ4ZmMtODJhOS0xZTJiNGZiODAzNzcKCkNvbnRlbnQtTGVuZ3RoOiAxMzEKQ29udGVudC1UeXBlOiBhcHBsaWNhdGlvbi9qc29uClNlbmRlci1JZGVudGlmaWVyOiA2NTE0NDQ0NAoKIntcImZlZVwiOjEsXCJ0cmFuc2ZlckNvZGVcIjpcInAycFwiLFwiZGViaXROYW1lXCI6XCJib2IgZHlsYW5cIixcImNyZWRpdE5hbWVcIjpcImFsaWNlIGNvb3BlclwiLFwiZGViaXRJZGVudGlmaWVyXCI6XCI2NTE0NDQ0NFwifSIA'},
              'amount': AMOUNT
            }],
            'execution_condition': 'ni:///sha-256;47DEQpj8HBSa-_TImW-5JCeuQeRkm5NMpJWZG3hSuFU?fpt=preimage-sha-256&cost=0',
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
