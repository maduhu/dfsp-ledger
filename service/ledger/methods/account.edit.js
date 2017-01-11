var joi = require('joi')
var error = require('../error')
var util = require('../util')
module.exports = {
  rest: function () {
    return {
      rpc: 'ledger.account.edit',
      path: '/ledger/accounts/{accountNumber}',
      method: 'post',
      config: {
        description: 'Edit account',
        tags: ['api'],
        validate: {
          params: {
            accountNumber: joi.string().required()
          },
          payload: {
            name: joi.string().min(1).required(),
            balance: joi.string().required()
          }
        },
        plugins: {
          'hapi-swagger': {
            responses: {
              '200': {
                description: 'Account edited successfully.',
                schema: joi.object({
                  id: joi.string(),
                  name: joi.string(),
                  balance: joi.string(),
                  currency: joi.string(),
                  is_disabled: joi.string().allow([0, 1])
                })
              }
            }
          }
        }
      }
    }
  },
  'account.edit.request.send': function (msg, $meta) {
    return {
      accountNumber: msg.accountNumber,
      debit: 0,
      crcreate: msg.balance,
      name: msg.name,
      accountTypeId: 1,
      currencyId: 'USD',
      isDisabled: msg.isDisabled
    }
  },
  'account.edit.response.receive': function (msg, $meta) {
    var account = msg[0]
    var baseUrl = util.get('baseUrl')
    if (account.length === 0) {
      throw error['ledger.account.edit.notFound']()
    }
    if (account.accountNumber.length === 0) {
      throw error['ledger.account.edit.invalidUriParameter']()
    }
    return {
      id: baseUrl + '/accounts/' + account.accountNumber,
      name: account.name,
      balance: account.balance,
      currency: account.currency,
      is_disabled: account.isDisabled
    }
  }
}
