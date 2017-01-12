var joi = require('joi')
var error = require('../error')
var util = require('../util')
module.exports = {
  rest: function () {
    var baseUrl = util.get('baseUrl')
    return {
      rpc: 'ledger.account.add',
      path: '/ledger/accounts/{accountNumber}',
      method: 'put',
      config: {
        description: 'Create account',
        tags: ['api'],
        validate: {
          params: {
            name: joi.string().min(1).required().description('Name of the new account'),
            balance: joi.string().required().description('Initial balance')
          },
          payload: {
            name: joi.string().min(1).required().example('alice'),
            balance: joi.string().required().example('1000')
          }
        },
        plugins: {
          'hapi-swagger': {
            responses: {
              '200': {
                description: 'Account created successfully.',
                schema: joi.object({
                  id: joi.string().example(baseUrl + '/ledger/accounts/00001011'),
                  name: joi.string().example('alice'),
                  balance: joi.string().example('1000'),
                  currency: joi.string().example('USD'),
                  is_disabled: joi.bool().example(false)
                })
              }
            }
          }
        }
      }
    }
  },
  'account.add.request.send': function (msg, $meta) {
    return {
      accountNumber: msg.accountNumber,
      debit: 0,
      credit: msg.balance,
      name: msg.name,
      displayName: msg.name,
      accountTypeId: 1,
      currencyId: 'USD'
    }
  },
  'account.add.response.receive': function (msg, $meta) {
    var account = msg[0]
    var baseUrl = util.get('baseUrl')
    if (account.length === 0) {
      throw error['ledger.account.add.notFound']()
    }
    if (account.accountNumber.length === 0) {
      throw error['ledger.account.add.invalidUriParameter']()
    }
    return {
      id: baseUrl + '/accounts/' + account.accountNumber,
      name: account.accountNumber,
      balance: account.balance,
      currency: account.currency,
      is_disabled: account.isDisabled
    }
  }
}
