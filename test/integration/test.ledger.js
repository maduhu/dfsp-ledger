var test = require('ut-run/test')
// var joi = require('joi')

test({
  type: 'integration',
  name: 'Ledger service',
  client: require('../client'),
  clientConfig: require('../client/test'),
  steps: function (test, bus, run) {
    run(test, bus, [{
      method: 'ledger.account.get',
      params: {
        id: 'testaccount'
      },
      name: 'Get existing account',
      result: (result, assert) => {
        assert.ok(result, 'return account')
      }
    }, {
      method: 'ledger.account.get',
      params: {
        id: 'nonexisting'
      },
      name: 'Get non existing account',
      result: (result, assert) => { // todo error handling
        assert.ok(result, 'return error')
      }
    }])
  }
})
