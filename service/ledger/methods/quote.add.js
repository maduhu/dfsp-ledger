var joi = require('joi')
var error = require('../error')
var util = require('../util')
module.exports = {
  'quote.add': function (msg, $meta) {
    return this.bus.importMethod('ledger.account.getConnector')({})
    .then((res) => {
      msg.connectorAccount = util.buildAccountResponse(res).id
      return this.super[$meta.method](msg, $meta)
    })
  }
}
