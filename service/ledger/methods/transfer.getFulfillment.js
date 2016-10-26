var joi = require('joi')
var error = require('../error')
module.exports = {
  rest: function () {
    return {
      rpc: 'ledger.transfer.getFulfillment',
      path: '/ledger/transfers/{id}/fulfillment',
      method: 'get',
      config: {
        description: 'Get Transfer Fulfillment',
        notes: 'Retrieve the fulfillment for a transfer that has been executed or cancelled.',
        tags: ['api'],
        validate: {
          params: joi.object({
            id: joi.string().required().regex(/^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/).example('3a2a1d9e-8640-4d2d-b06c-84f2cd613300').description('The UUID for the local transfer')
          })
        },
        plugins: {
          'hapi-swagger': {
            responses: {
              '200': {
                description: 'The body contains the Transfer\'s Crypto-Condition Fulfillment in text format.'
              }
            }
          }
        }
      }
    }
  },
  'transfer.getFulfillment.request.send': function (msg, $meta) {
    msg.uuid = msg.id
    return msg
  },
  'transfer.getFulfillment.response.receive': function (msg, $meta) {
    if (msg.length === 0 || msg[0]['transfer.getFulfillment'] === null) {
      throw error['ledger.transfer.getFulfillment.notFound']()
    }
    return msg[0]['transfer.getFulfillment']
  }
}
