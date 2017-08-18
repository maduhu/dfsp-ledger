var joi = require('joi')
var cc = require('five-bells-condition')
var error = require('../error')
var util = require('../util')
module.exports = {
  rest: function () {
    return {
      rpc: 'ledger.transfer.execute',
      path: '/ledger/transfers/{paymentId}/fulfillment',
      method: 'put',
      reply: (reply, response, $meta) => {
        if (!response.error) {
          return reply(response, {'content-type': 'text/plain'}, 200)
        }
        var defaultReply = util.get('defaultReply')
        return defaultReply(reply, response, $meta)
      },
      config: {
        description: 'Execute prepared transfer',
        notes: 'Execute or cancel a transfer that has already been prepared, by submitting a matching cryto-condition fulfillment. If the prepared transfer has an execution_condition, you can submit the fulfillment of that condition to execute the transfer. If the prepared transfer has a cancellation_condition, you can submit the fulfillment of that condition to cancel the transfer.',
        tags: ['api'],
        validate: {
          params: joi.object({
            paymentId: joi.string().required().regex(/^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/).example('3a2a1d9e-8640-4d2d-b06c-84f2cd613300').description('The paymentId for the local transfer')
          }),
          payload: joi.string().required().example('oAKAAA').description('Payload should be a Crypto-Condition Fulfillment in text format')
        },
        plugins: {
          'hapi-swagger': {
            consumes: ['text/plain'],
            responses: {
              '200': {
                description: 'Transfer was executed successfully.'
              }
            }
          }
        }
      }
    }
  },
  'transfer.execute.request.send': function (msg) {
    msg.fulfillment = msg.plainText
    msg.condition = cc.fulfillmentToCondition(msg.plainText)

    delete msg.plainText
    return msg
  },
  'transfer.execute.response.receive': function (msg) {
    if (msg.length === 0) {
      throw error['ledger.transfer.execute.notFound']()
    }
    var transfer = msg[0]
    delete transfer.creditMemo.ilp_decrypted
    var publish = util.get('publish')
    var buildTransferResource = util.get('buildTransferResource')
    var response = {
      resource: buildTransferResource(transfer),
      related_resources: {
        execution_condition_fulfillment: transfer.fulfillment
      }
    }
    publish({ account: transfer.debitAccount }, response)
    publish({ account: transfer.creditAccount }, response)
    return transfer.fulfillment
  }
}
