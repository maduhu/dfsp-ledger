require('../error')
var util = require('../util')
module.exports = {
  'quote.add': function (msg, $meta) {
    if (!msg.params) {
      msg.params = {}
    }
    if (!msg.connectorAccount) {
      return this.bus.importMethod('ledger.account.getConnector')({})
      .then((res) => {
        msg.connectorAccount = util.get('buildAccountResponse')(res).id
        if (!msg.params) {
          msg.params = {}
        }
        return this.super[$meta.method](msg, $meta)
      })
    }
    return this.super[$meta.method](msg, $meta)
  }
}
