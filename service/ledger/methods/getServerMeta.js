var joi = require('joi')
var util = require('../util')
module.exports = {
  rest: function () {
    return {
      rpc: 'ledger.getServerMeta',
      path: '/ledger',
      method: 'get',
      config: {
        description: 'Get Server Metadata',
        notes: 'Receive information about the ILP Ledger Adapter.',
        tags: ['api'],
        plugins: {
          'hapi-swagger': {
            responses: {
              '200': {
                description: 'Transfer was executed successfully.',
                schema: joi.object({
                  currency_code: joi.string().allow([null, '']),
                  currency_symbol: joi.string().allow([null, '']),
                  condition_sign_public_key: joi.string().allow([null, '']),
                  notification_sign_public_key: joi.string().allow([null, '']),
                  urls: joi.object({
                    transfer: joi.string(),
                    transfer_fulfillment: joi.string(),
                    transfer_state: joi.string(),
                    accounts: joi.string(),
                    account: joi.string(),
                    subscription: joi.string()
                  }),
                  precision: joi.number().integer(),
                  scale: joi.number().integer()
                })
              }
            }
          }
        }
      }
    }
  },
  'getServerMeta': function (msg, $meta) {
    var baseUrl = util.get('baseUrl')
    return {
      currency_code: null,
      currency_symbol: null,
      condition_sign_public_key: '',
      notification_sign_public_key: '',
      urls: {
        transfer: baseUrl + '/transfers/:id',
        transfer_fulfillment: baseUrl + '/transfers/:id/fulfillment',
        transfer_state: baseUrl + '/transfers/:id/state',
        accounts: baseUrl + '/accounts',
        account: baseUrl + '/accounts/:name',
        account_transfers: baseUrl.replace(/^https?:\/\//, 'ws://') + '/accounts/:name/transfers',
        subscription: baseUrl + '/subscriptions/:id'
      },
      precision: 10,
      scale: 2
    }
  }
}
