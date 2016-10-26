var joi = require('joi')
var error = require('../error')
var util = require('../util')
module.exports = {
  rest: function () {
    var baseUrl = util.get('baseUrl')
    return {
      rpc: 'ledger.transfer.hold',
      path: '/ledger/transfers/{id}',
      method: 'put',
      successStatusCode: 201,
      config: {
        description: 'Prepare/Propose transfer',
        notes: 'Prepares a new transfer in the ledger.',
        tags: ['api'],
        validate: {
          params: joi.object({
            id: joi.string().regex(/^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/).example('3a2a1d9e-8640-4d2d-b06c-84f2cd613300').description('The UUID for the local transfer')
          }),
          payload: {
            id: joi.string().required().example(baseUrl + '/transfers/3a2a1d9e-8640-4d2d-b06c-84f2cd613300'),
            ledger: joi.string().required().example(baseUrl),
            debits: joi.array().items(
              joi.object({
                account: joi.string().required().example(baseUrl + '/accounts/000000003'),
                amount: joi.number().required().example(50),
                memo: joi.object().optional(),
                authorized: joi.any().valid([true, false]).example(true)
              })
            ).required(),
            credits: joi.array().items(
              joi.object({
                account: joi.string().required().example(baseUrl + '/accounts/000000004'),
                memo: joi.object().optional(),
                amount: joi.number().required().example(50)
              })
            ).required(),
            execution_condition: joi.string().required().description('Crypto-Condition').example('cc:0:3:8ZdpKBDUV-KX_OnFZTsCWB_5mlCFI3DynX5f5H2dN-Y:2'),
            cancellation_condition: joi.string().allow(null).example(null),
            expires_at: joi.date().required().example('2015-06-16T00:00:01.000Z')
          }
        },
        plugins: {
          'hapi-swagger': {
            responses: {
              '201': {
                description: 'Transfer was created successfully',
                schema: joi.object({
                  id: joi.string(),
                  ledger: joi.string(),
                  debits: joi.array().items(
                    joi.object({
                      account: joi.string(),
                      memo: joi.object().optional(),
                      amount: joi.string()
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
                  state: joi.string().valid(['proposed', 'prepared'])
                })
              }
            }
          }
        }
      }
    }
  },
  'transfer.hold.request.send': function (msg, $meta) {
    var debit = msg.debits && msg.debits[0]
    var credit = msg.credits && msg.credits[0]
    var uriToLedgerAccount = util.get('uriToLedgerAccount')

    if (debit.amount !== credit.amount) {
      throw error['ledger.transfer.hold.unprocessableEntity']({ message: 'Debits and credits are not equal' })
    }

    return {
      uuid: msg.id,
      debitAccount: uriToLedgerAccount(debit.account),
      debitMemo: debit.memo,
      creditAccount: uriToLedgerAccount(credit.account),
      creditMemo: credit.memo,
      amount: debit.amount,
      executionCondition: msg.execution_condition,
      cancellationCondition: msg.cancellation_condition,
      state: (debit.authorized) ? 'prepared' : 'proposed',
      expiresAt: msg.expires_at,
      transferTypeId: 1 /* P2P */
    }
  },
  'transfer.hold.response.receive': function (msg, $meta) {
    var transfer = msg[0]
    var buildTransferResource = util.get('buildTransferResource')
    var publish = util.get('publish')
    var response = {
      resource: buildTransferResource(transfer)
    }
    publish({account: transfer.debitAccount}, response)
    publish({account: transfer.creditAccount}, response)
    return response.resource
  }
}
