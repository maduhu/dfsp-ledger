var joi = require('joi')
var error = require('../error')
var util = require('../util')
module.exports = {
  rest: function () {
    return {
      rpc: 'ledger.account.get',
      path: '/ledger/accounts/{accountNumber}',
      method: 'get',
      reply: (reply, response, $meta) => {
        if (!response.error) {
          response.name = response.accountNumber
          delete response.accountNumber
        }
        return util.get('defaultReply')(reply, response, $meta)
      },
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
                description: 'Account information was obtained successfully.',
                schema: joi.object().keys({
                  id: joi.string(),
                  name: joi.string(),
                  balance: joi.number(),
                  currencyCode: joi.string(),
                  currencySymbol: joi.string(),
                  is_disabled: joi.bool(),
                  ledger: joi.string()
                })
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
      accountNumber: account.accountNumber,
      currencyCode: account.currencyCode,
      currencySymbol: account.currencySymbol,
      is_disabled: account.isDisabled,
      ledger: baseUrl
    }
  }
}
