var path = require('path')
var cc = require('five-bells-condition')
var error = require('./error')
var joi = require('joi')
var domain = 'http://dfsp1:8014'
var ledgerPrefix = domain + '/ledger'
var publish
function buildTransferResource (transfer) {
  return {
    'id': ledgerPrefix + '/transfers/' + transfer.id,
    'ledger': ledgerPrefix,
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
    'state': transfer.state,
    'expires_at': transfer.expiresAt
  }
}
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
    try {
      publish = this.registerSocketServer('/accounts/{account}/transfers')
    } catch (e) {
      publish = function noop () {}
    }
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
        reply: (reply, response, $meta) => {
          if (!response.error) {
            return reply(response, {'content-type': 'application/json'}, 200)
          }

          return reply({
            id: response.error.type,
            message: response.error.message
          }, {'content-type': 'application/json'}, response.debug.statusCode || 400)
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
                  description: 'Transfer was executed successfully.',
                  schema: joi.object()
                }
              }
            }
          }
        },
        method: 'get'
      },
      {
        rpc: 'ledger.account.edit',
        path: '/ledger/accounts/{accountNumber}',
        reply: (reply, response, $meta) => {
          if (!response.error) {
            return reply(response, {'content-type': 'application/json'}, 200)
          }

          return reply({
            id: response.error.type,
            message: response.error.message
          }, {'content-type': 'application/json'}, response.debug.statusCode || 400)
        },
        config: {
          description: 'Create account',
          tags: ['api'],
          validate: {
            params: {
              accountNumber: joi.string().required()
            },
            payload: {
              name: joi.string().min(1).required(),
              balance: joi.string().required()
            },
            failAction: validationFailHandler
          },
          plugins: {
            'hapi-swagger': {
              responses: {
                '200': {
                  description: 'Account created successfully.',
                  schema: joi.object({
                    id: joi.string(),
                    name: joi.string(),
                    balance: joi.string(),
                    is_disabled: joi.string().allow([0, 1])
                  })
                }
              }
            }
          }
        },
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
          if (!response.error) {
            return reply(response, {'content-type': 'application/json'}, 201)
          }

          return reply({
            id: response.error.type,
            message: response.error.message
          }, {'content-type': 'application/json'}, response.debug.statusCode || 400)
        },
        config: {
          description: 'Prepare/Propose transfer',
          notes: 'Prepares a new transfer in the ledger.',
          tags: ['api'],
          validate: {
            params: joi.object({
              id: joi.string().regex(/^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/).example('3a2a1d9e-8640-4d2d-b06c-84f2cd613300').description('The UUID for the local transfer')
            }),
            payload: {
              id: joi.string().required().example(domain + '/transfers/3a2a1d9e-8640-4d2d-b06c-84f2cd613300'),
              ledger: joi.string().required().example(domain),
              debits: joi.array().items(
                joi.object({
                  account: joi.string().required().example(domain + '/accounts/000000003'),
                  amount: joi.number().required().example(50),
                  authorized: joi.any().valid([true, false]).example(true)
                })
              ).required(),
              credits: joi.array().items(
                joi.object({
                  account: joi.string().required().example(domain + '/accounts/000000004'),
                  amount: joi.number().required().example(50)
                })
              ).required(),
              execution_condition: joi.string().required().description('Crypto-Condition').example('cc:0:3:8ZdpKBDUV-KX_OnFZTsCWB_5mlCFI3DynX5f5H2dN-Y:2'),
              cancellation_condition: joi.string().allow(null).example(null),
              expires_at: joi.date().required().example('2015-06-16T00:00:01.000Z')
            },
            failAction: validationFailHandler
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
          if (!response.error) {
            return reply(response, {'content-type': 'application/json'}, 200)
          }

          return reply({
            id: response.error.type,
            message: response.error.message
          }, {'content-type': 'application/json'}, response.debug.statusCode || 400)
        },
        config: {
          description: 'Get Transfer by ID',
          notes: 'Check the details or status of a local transfer',
          tags: ['api'],
          validate: {
            params: joi.object({
              id: joi.string().regex(/^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/).example('3a2a1d9e-8640-4d2d-b06c-84f2cd613300').description('The UUID for the local transfer')
            }),
            failAction: validationFailHandler
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
          if (!response.error) {
            return reply(response, {'content-type': 'text/plain'}, 200)
          }

          return reply({
            id: response.error.type,
            message: response.error.message
          }, {'content-type': 'application/json'}, response.debug.statusCode || 400)
        },
        config: {
          description: 'Get Transfer Fulfillment',
          notes: 'Retrieve the fulfillment for a transfer that has been executed or cancelled.',
          tags: ['api'],
          validate: {
            params: joi.object({
              id: joi.string().required().regex(/^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/).example('3a2a1d9e-8640-4d2d-b06c-84f2cd613300').description('The UUID for the local transfer')
            }),
            failAction: validationFailHandler
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
          if (!response.error) {
            return reply(response, {'content-type': 'text/plain'}, 200)
          }

          return reply({
            id: response.error.type,
            message: response.error.message
          }, {'content-type': 'application/json'}, response.debug.statusCode || 400)
        },
        config: {
          description: 'Execute prepared transfer',
          notes: 'Execute or cancel a transfer that has already been prepared, by submitting a matching cryto-condition fulfillment. If the prepared transfer has an execution_condition, you can submit the fulfillment of that condition to execute the transfer. If the prepared transfer has a cancellation_condition, you can submit the fulfillment of that condition to cancel the transfer.',
          tags: ['api'],
          validate: {
            params: joi.object({
              transferId: joi.string().required().regex(/^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/).example('3a2a1d9e-8640-4d2d-b06c-84f2cd613300').description('The UUID for the local transfer')
            }),
            payload: joi.string().required().example('cf:0:_v8').description('Payload should be a Crypto-Condition Fulfillment in text format'),
            failAction: validationFailHandler
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
      },
      {
        rpc: 'ledger.getServerMeta',
        path: '/ledger',
        reply: (reply, response, $meta) => {
          return reply(response, {'content-type': 'application/json'}, 200)
        },
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
                    currency_code: joi.string().allow(null),
                    currency_symbol: joi.string().allow(null),
                    condition_sign_public_key: joi.string().allow(null),
                    notification_sign_public_key: joi.string().allow(null),
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
        },
        method: 'get'
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

    if (debit.amount !== credit.amount) {
      throw error.unprocessableEntity({ message: 'Debits and credits are not equal' })
    }

    return {
      uuid: msg.id,
      debitAccount: uriToLedgerAccount(debit.account),
      creditAccount: uriToLedgerAccount(credit.account),
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
    var response = {
      resource: buildTransferResource(transfer)
    }
    publish({account: transfer.debitAccount}, response)
    publish({account: transfer.creditAccount}, response)
    return response.resource
  },
  'transfer.hold.error.receive': function (err, $meta) {
    switch (err.message) {
      case 'ledger.insufficientFunds':
        throw error.insufficientFunds()
      case 'ledger.alreadyExists':
        throw error.alreadyExist()
      case 'ledger.debitAccountNotFound':
      case 'ledger.creditAccountNotFound':
        throw error.unprocessableEntity({ message: 'Account `unknown` does not exist' })
      default:
        throw error.unknown()
    }
  },
  'transfer.execute.request.send': function (msg, $meta) {
    msg.fulfillment = msg.plainText
    msg.condition = cc.fulfillmentToCondition(msg.plainText)

    delete msg.plainText
    return msg
  },
  'transfer.execute.response.receive': function (msg, $meta) {
    if (msg.length === 0) {
      throw error.notFound({ message: 'Unknown transfer.' })
    }
    var transfer = msg[0]
    var response = {
      resource: buildTransferResource(transfer),
      related_resources: {
        execution_condition_fulfillment: transfer.fulfillment
      }
    }
    publish({account: transfer.debitAccount}, response)
    publish({account: transfer.creditAccount}, response)
    return transfer.fulfillment
  },
  'transfer.execute.error.receive': function (err, $meta) {
    switch (err.message) {
      case 'transfer.unmetCondition':
        throw error.unmetCondition()
      case 'ledger.transferIsProcessedAlready':
        throw error.alreadyExists()
      default:
        throw error.unknown()
    }
  },
  'transfer.getFulfillment.request.send': function (msg, $meta) {
    msg.uuid = msg.id
    return msg
  },
  'transfer.getFulfillment.response.receive': function (msg, $meta) {
    if (msg.length === 0 || msg[0]['transfer.getFulfillment'] === null) {
      throw error.notFound({ message: 'Unknown transfer.' })
    }
    return msg[0]['transfer.getFulfillment']
  },
  'transfer.get.request.send': function (msg, $meta) {
    msg.uuid = msg.id
    return msg
  },
  'transfer.get.response.receive': function (msg, $meta) {
    var transfer = msg[0]
    if (msg.length === 0) {
      throw error.notFound({ message: 'Unknown transfer.' })
    }
    return {
      'id': ledgerPrefix + '/transfers/' + transfer.uuid,
      'ledger': ledgerPrefix,
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
  },
  'account.get.response.receive': function (msg, $meta) {
    var account = msg[0]
    if (msg.length === 0) {
      throw error.notFound({ message: 'Unknown account.' })
    }

    return {
      id: domain + '/accounts/' + account.accountNumber,
      name: account.accountNumber,
      balance: account.balance,
      is_disabled: account.isDisable
    }
  },
  'getServerMeta': function (msg, $meta) {
    return {
      currency_code: null,
      currency_symbol: null,
      condition_sign_public_key: '',
      notification_sign_public_key: '',
      urls: {
        transfer: ledgerPrefix + '/transfers/:id',
        transfer_fulfillment: ledgerPrefix + '/transfers/:id/fulfillment',
        transfer_state: ledgerPrefix + ledgerPrefix + '/transfers/:id/state',
        accounts: domain + '/accounts',
        account: domain + '/accounts/:name',
        subscription: ledgerPrefix + '/subscriptions/:id'
      },
      precision: 10,
      scale: 2
    }
  },
  'account.edit.request.send': function (msg, $meta) {
    return {
      accountNumber: msg.accountNumber,
      debit: 0,
      credit: msg.balance,
      name: msg.name,
      displayName: msg.name,
      accountTypeId: 1,
      currencyId: 'USD'
    }
  },
  'account.edit.response.receive': function (msg, $meta) {
    var account = msg[0]
    if (account.length === 0) {
      throw error.notFound({ message: 'Unknown account.' })
    }
    if (account.accountNumber.length === 0) {
      throw error.InvalidUriParameter()
    }
    return {
      id: ledgerPrefix + '/accounts/' + account.accountNumber,
      name: account.accountNumber,
      balance: account.balance,
      is_disabled: !account.isActive
    }
  }
}

function ledgerAccountToUri (accountNumber) {
  return domain + '/accounts/' + accountNumber
}
function uriToLedgerAccount (uri) {
  var account = (typeof uri === 'string') && uri.split(domain + '/accounts/')[1]
  if (!account) {
    throw error.accountNotFound({
      uri: uri
    })
  }
  return account
}

function validationFailHandler (request, reply, source, error) {
  var response = {}
  if (source === 'params') {
    response.id = 'InvalidUriParameterError'
    response.message = 'id is not a valid Uuid'
  } else {
    response.id = 'InvalidBodyError'
    response.message = 'Body did not match schema'
  }

  response.validationErrors = []
  error.data.details.forEach((err) => {
    response.validationErrors.push({
      message: err.message,
      params: err.context
    })
  })
  return reply(response)
}
