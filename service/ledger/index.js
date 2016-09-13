var path = require('path')
var cc = require('five-bells-condition')
var error = require('./error')
var ledgerAddress = 'localhost:8014/ledger'
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

    function rest (request, reply, method) {
      // Used in case header is "Content-Type: text/plain"
      if (typeof request.payload === 'string') {
        request.payload = Object.assign({plainText: request.payload}, request.params)
      } else if (request.payload === null) {
        request.payload = Object.assign({}, request.params)
      } else {
        Object.assign(request.payload.params, request.params)
      }
      request.params.method = method
      return port.handler(request, reply)
    }

    var routes = [
      { rpc: 'ledger.account.get', path: '/ledger/accounts/{accountNumber}', method: 'get' },
      { rpc: 'ledger.account.edit', path: '/ledger/accounts/{accountNumber}', method: 'put' },
      { rpc: 'ledger.connectors.get', path: '/ledger/connectors', method: 'get' },
      { rpc: 'ledger.transfer.hold', path: '/ledger/transfers/{id}', method: 'put' },
      { rpc: 'ledger.transfer.get', path: '/ledger/transfers/{id}', method: 'get' },
      { rpc: 'ledger.transfer.getFulfillment', path: '/ledger/transfers/{id}/fulfillment', method: 'get' },
      { rpc: 'ledger.transfer.getState', path: '/ledger/transfers/{id}/state', method: 'get' },
      { rpc: 'ledger.transfer.execute', path: '/ledger/transfers/{transferId}/fulfillment', method: 'put' }
    ].map((route) => {
      return {
        method: route.method,
        path: route.path,
        handler: (request, reply) => rest(request, reply, route.rpc),
        config: { auth: false }
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
        'account': ledgetAccountToUri(transfer.debitAccount),
        'amount': transfer.amount
      }],
      'credits': [{
        'account': ledgetAccountToUri(transfer.creditAccount),
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
    return {
      'fulfillment': msg[0]['fulfillment']
    }
  },
  'transfer.getFulfillment.request.send': function (msg, $meta) {
    msg.uuid = msg.id
    return msg
  },
  'transfer.getFulfillment.response.receive': function (msg, $meta) {
    if (msg[0]['transfer.getFulfillment'] === null) {
      throw error.transferNotFound()
    }
    return {
      fulfillment: msg[0]['transfer.getFulfillment']
    }
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
        'account': ledgetAccountToUri(transfer.debitAccount),
        'amount': transfer.amount
      }],
      'credits': [{
        'account': ledgetAccountToUri(transfer.creditAccount),
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

function ledgetAccountToUri (accountNumber) {
  return ledgerAddress + '/accounts/' + accountNumber
}
