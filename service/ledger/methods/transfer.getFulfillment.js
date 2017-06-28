var joi = require('joi')
var error = require('../error')
var util = require('../util')
module.exports = {
  rest: function () {
    return {
      rpc: 'ledger.transfer.getFulfillment',
      path: '/ledger/transfers/{paymentId}/fulfillment',
      method: 'get',
      reply: (reply, response, $meta) => {
        if (!response.error) {
          return reply(response, {'content-type': 'text/plain'}, 200)
        }
        var defaultReply = util.get('defaultReply')
        return defaultReply(reply, response, $meta)
      },
      config: {
        description: 'Get Transfer Fulfillment',
        notes: 'Retrieve the fulfillment for a transfer that has been executed or cancelled.',
        tags: ['api'],
        validate: {
          params: joi.object({
            paymentId: joi.string().required().regex(/^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/).example('3a2a1d9e-8640-4d2d-b06c-84f2cd613300').description('The paymentId for the local transfer')
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
  'transfer.getFulfillment.response.receive': function (msg, $meta) {
    if (msg.length === 0 || msg[0]['transfer.getFulfillment'] === null) {
      throw error['ledger.transfer.getFulfillment.notFound']()
    }
    return msg[0]['transfer.getFulfillment']
  }
}
