var path = require('path')
var cc = require('five-bells-condition')
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
    if (!Array.isArray(msg.debits) || !Array.isArray(msg.credits) || msg.debits.length !== 1 || msg.credits.length !== 1) {
      // TODO: throw invalid params exception
    }
    if (msg.debits[0].amount !== msg.credits[0].amount) {
      // TODO: throw invalid params exception
    }
    msg.debitAccount = msg.debits[0].account.split('/').pop()
    msg.creditAccount = msg.credits[0].account.split('/').pop()
    msg.amount = msg.debits[0].amount
    msg.authorized = msg.debits[0].authorized ? 1 : 0

    delete msg.debits
    delete msg.credits
    delete msg.ledger

    return msg
  },
  'transfer.execute.request.send': function (msg, $meta) {
    msg.fulfillment = msg.plainText
    msg.condition = cc.fulfillmentToCondition(msg.plainText)

    delete msg.plainText
    return msg
  },
  'transfer.get.response.receive': function (msg, $meta) {
    msg.debits = [{
      'account': ledgetAccountToUri(msg.debitAccount),
      'amount': msg.amount
    }]
    msg.credits = [{
      'account': ledgetAccountToUri(msg.creditAccount),
      'amount': msg.amount
    }]
    msg.timeline = {
      'proposed_at': msg.proposedAt,
      'prepared_at': msg.preparedAt,
      'executed_at': msg.executedAt
    }
    return msg
  }
}

function ledgetAccountToUri (accountNumber) {
  return 'localhost:8014/ledger/accounts/' + accountNumber
}
