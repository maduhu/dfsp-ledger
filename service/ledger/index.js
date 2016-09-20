var path = require('path')
var cc = require('five-bells-condition')
var error = require('./error')
var joi = require('joi')
var ledgerAddress = 'dfsp1:8014/ledger'
module.exports = {
  schema: [{
    path: path.join(__dirname, 'schema'),
    linkSP: true
  }],
  start: function () {
    if (!this.registerRequestHandler) {
      return
    }
    var port = this

    function rest (request, reply, method, customReply) {
      // Used in case header is "Content-Type: text/plain"
      if (typeof request.payload === 'string') {
        request.payload = Object.assign({plainText: request.payload}, request.params)
      } else if (request.payload === null) {
        request.payload = Object.assign({}, request.params)
      } else {
        request.payload = Object.assign({}, request.payload, request.params)
      }
      request.params.method = method
      return port.handler(request, reply, customReply)
    }

    var routes = [
      {
        rpc: 'ledger.account.get',
        path: '/ledger/accounts/{accountNumber}',
        method: 'get'
      },
      {
        rpc: 'ledger.account.edit',
        path: '/ledger/accounts/{accountNumber}',
        method: 'put'
      },
      {
        rpc: 'ledger.connectors.get',
        path: '/ledger/connectors',
        method: 'get'
      },
      {
        rpc: 'ledger.transfer.hold',
        path: '/ledger/transfers/{id}',
        reply: (reply, response, $meta) => {
          reply(response, {'content-type': 'application/json'}, 201)
        },
        config: {
          description: 'Prepare/Propose transfer',
          notes: 'Prepares a new transfer in the ledger.',
          tags: ['api'],
          validate: {
            params: joi.object({
              id: joi.string().example('3a2a1d9e-8640-4d2d-b06c-84f2cd613300').description('The UUID for the local transfer')
            }),
            payload: {
              id: joi.string().required().example('http://dfsp1:8014/transfers/3a2a1d9e-8640-4d2d-b06c-84f2cd613300'),
              ledger: joi.string().required().example('http://dfsp1:8014'),
              debits: joi.array().items(
                joi.object({
                  account: joi.string().example('http://dfsp1:8014/accounts/000000003'),
                  amount: joi.number().example(50),
                  authorized: joi.any().valid([true, false]).example(true)
                }).required()
              ),
              credits: joi.array().items(
                joi.object({
                  account: joi.string().example('http://dfsp1:8014/accounts/000000004'),
                  amount: joi.number().example(50)
                }).required()
              ),
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
                        amount: joi.string()
                      })
                    ),
                    credits: joi.array().items(
                      joi.object({
                        account: joi.string(),
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
        },
        method: 'put'
      },
      {
        rpc: 'ledger.transfer.get',
        path: '/ledger/transfers/{id}',
        reply: (reply, response, $meta) => {
          reply(response, {'content-type': 'application/json'}, 200)
        },
        config: {
          description: 'Get Transfer by ID',
          notes: 'Check the details or status of a local transfer',
          tags: ['api'],
          validate: {
            params: joi.object({
              id: joi.string().example('3a2a1d9e-8640-4d2d-b06c-84f2cd613300').description('The UUID for the local transfer')
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
                        amount: joi.number()
                      })
                    ),
                    credits: joi.array().items(
                      joi.object({
                        account: joi.string(),
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
        },
        method: 'get'
      },
      {
        rpc: 'ledger.transfer.getFulfillment',
        path: '/ledger/transfers/{id}/fulfillment',
        reply: (reply, response, $meta) => {
          reply(response, {'content-type': 'text/plain'}, 200)
        },
        config: {
          description: 'Get Transfer Fulfillment',
          notes: 'Retrieve the fulfillment for a transfer that has been executed or cancelled.',
          tags: ['api'],
          validate: {
            params: joi.object({
              id: joi.string().example('3a2a1d9e-8640-4d2d-b06c-84f2cd613300').description('The UUID for the local transfer')
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
        },
        method: 'get'
      },
      {
        rpc: 'ledger.transfer.getState',
        path: '/ledger/transfers/{id}/state',
        method: 'get'
      },
      {
        rpc: 'ledger.transfer.execute',
        path: '/ledger/transfers/{transferId}/fulfillment',
        reply: (reply, response, $meta) => {
          reply(response, {'content-type': 'text/plain'}, 200)
        },
        config: {
          description: 'Execute prepared transfer',
          notes: 'Execute or cancel a transfer that has already been prepared, by submitting a matching cryto-condition fulfillment. If the prepared transfer has an execution_condition, you can submit the fulfillment of that condition to execute the transfer. If the prepared transfer has a cancellation_condition, you can submit the fulfillment of that condition to cancel the transfer.',
          tags: ['api'],
          validate: {
            params: joi.object({
              transferId: joi.string().example('3a2a1d9e-8640-4d2d-b06c-84f2cd613300').description('The UUID for the local transfer')
            }),
            payload: joi.string().example('cf:0:_v8').description('Payload should be a Crypto-Condition Fulfillment in text format')
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
        },
        method: 'put'
      }
    ].map((route) => {
      return {
        method: route.method,
        path: route.path,
        handler: (request, reply) => rest(request, reply, route.rpc, route.reply),
        config: Object.assign({
          auth: false
        }, route.config)
      }
    })

    this.registerRequestHandler(routes)
  },
  'transfer.hold.request.send': function (msg, $meta) {
    var debit = msg.debits && msg.debits[0]
    var credit = msg.credits && msg.credits[0]
    if (!credit || !debit) {
      // TODO: throw invalid params exception
    }
    if (debit.amount !== credit.amount) {
      // TODO: throw invalid params exception
    }

    return {
      uuid: msg.id,
      debitAccount: debit.account.split('/').pop(),
      creditAccount: credit.account.split('/').pop(),
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
    return {
      'id': ledgerAddress + '/transfers/' + transfer.id,
      'ledger': ledgerAddress,
      'debits': [{
        'account': ledgerAccountToUri(transfer.debitAccount),
        'amount': transfer.amount
      }],
      'credits': [{
        'account': ledgerAccountToUri(transfer.creditAccount),
        'amount': transfer.amount
      }],
      'execution_condition': transfer.executionCondition,
      'cancellation_condition': transfer.cancellationCondition,
      'expires_at': transfer.expiresAt
    }
  },
  'transfer.execute.request.send': function (msg, $meta) {
    msg.fulfillment = msg.plainText
    msg.condition = cc.fulfillmentToCondition(msg.plainText)

    delete msg.plainText
    return msg
  },
  'transfer.execute.response.receive': function (msg, $meta) {
    return msg[0]['fulfillment']
  },
  'transfer.getFulfillment.request.send': function (msg, $meta) {
    msg.uuid = msg.id
    return msg
  },
  'transfer.getFulfillment.response.receive': function (msg, $meta) {
    if (msg[0]['transfer.getFulfillment'] === null) {
      throw error.transferNotFound()
    }
    return msg[0]['transfer.getFulfillment']
  },
  'transfer.get.request.send': function (msg, $meta) {
    msg.uuid = msg.id
    return msg
  },
  'transfer.get.response.receive': function (msg, $meta) {
    var transfer = msg[0]

    return {
      'id': ledgerAddress + '/transfers/' + transfer.uuid,
      'ledger': ledgerAddress,
      'debits': [{
        'account': ledgerAccountToUri(transfer.debitAccount),
        'amount': transfer.amount
      }],
      'credits': [{
        'account': ledgerAccountToUri(transfer.creditAccount),
        'amount': transfer.amount
      }],
      'execution_condition': transfer.executionCondition,
      'cancellation_condition': transfer.cancellationCondition,
      'expires_at': transfer.expiresAt,
      'state': transfer.state,
      'timeline': {
        'proposed_at': transfer.proposedAt,
        'prepared_at': transfer.preparedAt,
        'executed_at': transfer.executedAt
      }
    }
  }
}

function ledgerAccountToUri (accountNumber) {
  return ledgerAddress + '/accounts/' + accountNumber
}
