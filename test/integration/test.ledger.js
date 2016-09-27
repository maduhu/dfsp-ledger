var request = require('supertest-as-promised')('http://localhost:8014/ledger/transfers/')
var test = require('ut-run/test')
var config = require('./../lib/appConfig')
var joi = require('joi')
var uuid = require('uuid')
const UUID = uuid.v4()
const BASE = 'http://dfsp1:8014'
const DEBITACCOUNT = BASE + '/accounts/000000001'
const CREDITACCOUNT = BASE + '/accounts/000000002'
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
      name: 'Transfer hold',
      params: (context) => {
        return request
          .put(UUID)
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
          .put(UUID + '/fulfillment')
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
          .get(UUID + '/fulfillment')
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
          .get(UUID)
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
