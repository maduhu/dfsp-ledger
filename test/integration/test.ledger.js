/*eslint no-console:0*/
var path = require('path')
var test = require('blue-tape')
var request = require('supertest-as-promised')
require('ut-run').run({}, {
  require: (p) => require(path.join('../../', p))
}).then((result) => {
  var listener = result.ports.reduce((listener, port) => (listener || (port.hapiServer && port.hapiServer.listener)), null)
  test('Prepare Transfer', (assert) => {
    request(listener)
    .put('/ledger/transfers/3a2a1d9e-8640-4d2d-b06c-84f2cd613213')
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
    .end((err, res) => {
      console.log('err', err)
      console.log('res', res.text)
    })
  })
})
