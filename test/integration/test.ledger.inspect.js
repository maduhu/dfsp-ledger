var test = require('ut-run/test')
var config = require('./../lib/appConfig')
const request = require('supertest')('http://localhost:8014')
const QUERY = 'SELECT * FROM ledger.account'

test({
  type: 'integration',
  name: 'Ledger',
  server: config.server,
  serverConfig: config.serverConfig,
  client: config.client,
  clientConfig: config.clientConfig,
  steps: function (test, bus, run) {
    return run(test, bus, [{
      name: 'Pass incorrect password to the inspector',
      params: (context) => {
        return request
          .put('/sql/inspect/wrongPass')
          .set('Content-Type', 'text/plain')
          .send(QUERY)
      },
      result: (result, assert) => {
        assert.equal(result.status, 400, 'Check that the password did not matched')
      }
    }
    ])
  }
}, module.parent)
