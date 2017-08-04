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
                  accountType: joi.string(),
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
  'account.get': function (msg, $meta) {
    if (msg.accountNumber === 'noaccount') {
      return util.get('buildAccountResponse')({
        accountNumber: msg.accountNumber,
        name: msg.accountNumber,
        balance: '0.00',
        currencyCode: 'TZS',
        currencySymbol: 'TSh',
        accountType: 'mWallet',
        is_disabled: true
      })
    }
    return this.super[$meta.method](msg, $meta)
      .then(function (result) {
        var account = result[0]
        if (result.length === 0) {
          throw error['ledger.account.get.notFound']({ message: 'Unknown account.' })
        }
        return util.get('buildAccountResponse')(account)
      })
  }
}
