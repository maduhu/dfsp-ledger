var create = require('ut-error').define

var Ledger = create('ledger')
var NotImportedByHttpPort = create('notImportedByHttpPort', Ledger)
var AccountNotFound = create('accountNotFound', Ledger)

module.exports = {
  ledger: function (cause) {
    return new Ledger(cause)
  },
  notImportedByHttpPort: function () {
    return new NotImportedByHttpPort({
      message: 'ledger.start method must be imported by an HTTP server port!'
    })
  },
  accountNotFound: function (params) {
    return new AccountNotFound({
      message: 'Account not found',
      params: params
    })
  }
}
