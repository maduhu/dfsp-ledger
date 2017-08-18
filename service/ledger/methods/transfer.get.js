var joi = require('joi')
var error = require('../error')
var util = require('../util')
module.exports = {
  rest: function () {
    return {
      rpc: 'ledger.transfer.get',
      path: '/ledger/transfers/{paymentId}',
      method: 'get',
      config: {
        description: 'Get Transfer by ID',
        notes: 'Check the details or status of a local transfer',
        tags: ['api'],
        validate: {
          params: joi.object({
            paymentId: joi.string().regex(/^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/).example('3a2a1d9e-8640-4d2d-b06c-84f2cd613300').description('The paymentId for the local transfer')
          })
        },
        plugins: {
          'hapi-swagger': {
            responses: {
              '200': {
                description: 'Transfer was executed successfully.',
                schema: joi.object({
                  id: joi.string(),
                  ledger: joi.string(),
                  debits: joi.array().items(
                    joi.object({
                      account: joi.string(),
                      memo: joi.object().optional(),
                      amount: joi.number()
                    })
                  ),
                  credits: joi.array().items(
                    joi.object({
                      account: joi.string(),
                      memo: joi.object().optional(),
                      amount: joi.number()
                    })
                  ),
                  execution_condition: joi.string(),
                  expires_at: joi.date(),
                  state: joi.string().valid(['executed']),
                  timeline: joi.object({
                    proposed_at: joi.date(),
                    prepared_at: joi.date(),
                    executed_at: joi.date()
                  })
                })
              }
            }
          }
        }
      }
    }
  },
  'transfer.get.response.receive': function (msg) {
    var transfer = msg[0]
    var baseUrl = util.get('baseUrl')
    if (msg.length === 0) {
      throw error['ledger.transfer.get.notFound']()
    }
    var ledgerAccountToUri = util.get('ledgerAccountToUri')
    var response = {
      'id': baseUrl + '/transfers/' + transfer.paymentId,
      'ledger': baseUrl,
      'debits': [{
        'account': ledgerAccountToUri(transfer.debitAccount),
        'amount': transfer.amount,
        'memo': transfer.debitMemo
      }],
      'credits': [{
        'account': ledgerAccountToUri(transfer.creditAccount),
        'amount': transfer.amount,
        'memo': transfer.creditMemo
      }],
      'execution_condition': transfer.executionCondition,
      'cancellation_condition': transfer.cancellationCondition,
      'expires_at': transfer.expiresAt,
      'state': transfer.state,
      'timeline': {}
    }
    if (transfer.proposedAt) {
      response.timeline.proposed_at = transfer.proposedAt
    }
    if (transfer.preparedAt) {
      response.timeline.prepared_at = transfer.proposedAt
    }
    if (transfer.executedAt) {
      response.timeline.executed_at = transfer.executedAt
    }
    if (transfer.rejectedAt) {
      response.timeline.rejected_at = transfer.rejectedAt
    }
    return response
  }
}
