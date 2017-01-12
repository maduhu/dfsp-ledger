var joi = require('joi')
var error = require('../error')
var util = require('../util')
module.exports = {
  rest: function () {
    return {
      rpc: 'ledger.account.get',
      path: '/ledger/accounts/{accountNumber}',
      method: 'get',
      config: {
        description: 'Get ledger account',
        notes: 'Receive information about ledger account.',
        tags: ['api'],
        validate: {
          params: {
            accountNumber: joi.string().required()
          }
        },
        plugins: {
          'hapi-swagger': {
            responses: {
              '200': {
                description: 'Transfer was executed successfully.',
                schema: joi.object()
              }
            }
          }
        }
      }
    }
  },
  'account.get.response.receive': function (msg, $meta) {
    var account = msg[0]
    var baseUrl = util.get('baseUrl')
    if (msg.length === 0) {
      throw error['ledger.account.get.notFound']({ message: 'Unknown account.' })
    }
    return {
      id: baseUrl + '/accounts/' + account.accountNumber,
      name: account.name,
      balance: account.balance,
      currencyCode: account.currencyCode,
      currencySymbol: account.currencySymbol,
      is_disabled: account.isDisabled,
      ledger: baseUrl
    }
  }
}
