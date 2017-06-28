var joi = require('joi')
var error = require('../error')
var util = require('../util')
module.exports = {
  rest: function () {
    return {
      rpc: 'ledger.transfer.reject',
      path: '/ledger/transfers/{paymentId}/rejection',
      method: 'put',
      config: {
        description: 'Reject prepared transfer',
        notes: 'Reject a transfer that has already been prepared.',
        tags: ['api'],
        validate: {
          params: joi.object({
            paymentId: joi.string().required().regex(/^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/).example('3a2a1d9e-8640-4d2d-b06c-84f2cd613300').description('The payment Id for the local transfer')
          }),
          payload: joi.string().required().example('BlacklistedSender').description('Rejection reason')
        },
        plugins: {
          'hapi-swagger': {
            consumes: ['text/plain'],
            responses: {
              '200': {
                description: 'Transfer was rejected successfully.',
                schema: joi.object({
                  id: joi.string(),
                  ledger: joi.string(),
                  debits: joi.array().items(
                    joi.object({
                      account: joi.string(),
                      memo: joi.object().optional(),
                      amount: joi.string(),
                      authorized: joi.any().valid([true, false]).example(true)
                    })
                  ),
                  credits: joi.array().items(
                    joi.object({
                      account: joi.string(),
                      memo: joi.object().optional(),
                      amount: joi.string()
                    })
                  ),
                  execution_condition: joi.string(),
                  expires_at: joi.date(),
                  state: joi.string().valid(['rejected']),
                  timeline: joi.array()
                })
              }
            }
          }
        }
      }
    }
  },
  'transfer.reject.request.send': function (msg, $meta) {
    msg.reason = msg.plainText
    delete msg.plainText
    return msg
  },
  'transfer.reject.response.receive': function (msg, $meta) {
    if (msg.length === 0) {
      throw error['ledger.transfer.reject.notFound']()
    }
    var transfer = msg[0]
    var publish = util.get('publish')
    var resource = util.get('buildTransferResource')(transfer)
    resource.timeline = {
      prepared_at: transfer.preparedAt,
      rejected_at: transfer.rejectedAt
    }
    publish({account: transfer.debitAccount}, {resource: resource})
    publish({account: transfer.creditAccount}, {resource: resource})
    return resource
  }
}
