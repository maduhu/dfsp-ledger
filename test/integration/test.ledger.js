/*eslint no-console:0*/
var request = require('supertest-as-promised')
var test = require('ut-run/test')
var config = require('./../lib/appConfig')

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
        return request('http://localhost:8014/ledger/transfers')
        .put('/3a2a1d9e-8640-4d2d-b06c-84f2cd613213')
        .send({
          'id': 'http://usd-ledger.example/transfers/3a2a1d9e-8640-4d2d-b06c-84f2cd613213',
          'ledger': 'http://usd-ledger.example',
          'debits': [{
            'account': 'http://usd-ledger.example/accounts/000000001',
            'amount': '50',
            'authorized': true
          }],
          'credits': [{
            'account': 'http://usd-ledger.example/accounts/000000002',
            'amount': '50'
          }],
          'execution_condition': 'cc:0:3:8ZdpKBDUV-KX_OnFZTsCWB_5mlCFI3DynX5f5H2dN-Y:2',
          'expires_at': '2015-06-16T00:00:01.000Z'
        })
        .expect('Content-Type', /json/)
        .expect(201)
      },
      result: (result, assert) => {
        console.log(result.body)
      },
      error: (error, assert) => {
        console.log(error)
      }
    },
    {
      name: 'Transfer hold2',
      params: (context) => {
        return request('http://localhost:8014/ledger/transfers')
        .put('/3a2a1d9e-8640-4d2d-b06c-84f2cd613213')
        .send({
          'id': 'http://usd-ledger.example/transfers/3a2a1d9e-8640-4d2d-b06c-84f2cd613213',
          'ledger': 'http://usd-ledger.example',
          'debits': [{
            'account': 'http://usd-ledger.example/accounts/000000001',
            'amount': '50',
            'authorized': true
          }],
          'credits': [{
            'account': 'http://usd-ledger.example/accounts/000000002',
            'amount': '50'
          }],
          'execution_condition': 'cc:0:3:8ZdpKBDUV-KX_OnFZTsCWB_5mlCFI3DynX5f5H2dN-Y:2',
          'expires_at': '2015-06-16T00:00:01.000Z'
        })
        .expect('Content-Type', /json/)
        .expect(201)
      },
      result: (result, assert) => {
        console.log(result.body)
      },
      error: (error, assert) => {
        console.log(error)
      }
    }])
  }
}, module.parent)
