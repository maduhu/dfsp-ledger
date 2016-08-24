var create = require('ut-error').define

var Ledger = create('ledger')
var AccountNotFound = create('accountNotFound', Ledger)

module.exports = {
  ledger: function (cause) {
    return new Ledger(cause)
  },
  accountNotFound: function (params) {
    return new AccountNotFound({
      message: 'Account not found',
      params: params
    })
  }
}
