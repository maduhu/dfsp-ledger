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
                  connectors: joi.array().items(joi.object().keys({
                    id: joi.string(),
                    name: joi.string()
                  })),
                  urls: joi.object({
                    health: joi.string(),
                    transfer: joi.string(),
                    transfer_fulfillment: joi.string(),
                    transfer_rejection: joi.string(),
                    // transfer_state: joi.string(),
                    accounts: joi.string(),
                    account: joi.string(),
                    auth_token: joi.string(),
                    // account_transfers: joi.string(),
                    // subscription: joi.string(),
                    websocket: joi.string()
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
      connectors: [{
        id: baseUrl + '/connector',
        name: 'connector'
      }],
      urls: {
        health: baseUrl + '/health',
        transfer: baseUrl + '/transfers/:id',
        transfer_fulfillment: baseUrl + '/transfers/:id/fulfillment',
        transfer_rejection: baseUrl + '/transfers/:id/rejection',
        // transfer_state: baseUrl + '/transfers/:id/state',
        accounts: baseUrl + '/accounts',
        account: baseUrl + '/accounts/:name',
        auth_token: baseUrl + '/auth_token',
        // account_transfers: baseUrl.replace(/^https?:\/\//, 'ws://') + '/accounts/:name/transfers',
        // subscription: baseUrl + '/subscriptions/:id',
        websocket: baseUrl.replace(/^https?:\/\//, 'ws://') + '/websocket',
        message: baseUrl + '/messages'
      },
      precision: 10,
      scale: 2
    }
  }
}
