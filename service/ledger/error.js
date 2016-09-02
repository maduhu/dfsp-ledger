var create = require('ut-error').define

var Ledger = create('ledger')
var AccountNotFound = create('accountNotFound', Ledger)
var TransferNotFound = create('transferNotFound', Ledger)

module.exports = {
  ledger: function (cause) {
    return new Ledger(cause)
  },
  accountNotFound: function (params) {
    return new AccountNotFound({
      message: 'Account not found',
      params: params
    })
  },
  transferNotFound: function (params) {
    return new TransferNotFound({
      message: 'Transfer not found',
      params: params
    })
  }
}
