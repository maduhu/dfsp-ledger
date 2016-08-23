var path = require('path')
var cc = require('five-bells-condition')
module.exports = {
  schema: [{
    path: path.join(__dirname, 'schema'),
    linkSP: true
  }],
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

    return msg
  },
  'transfer.execute.request.send': function (msg, $meta) {
    msg.fulfillment = msg.params.plainText
    msg.condition = cc.fulfillmentToCondition(msg.params.plainText)

    delete msg.params.plainText
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
