var error = require('../error')
var util = require('../util')
module.exports = {
  'account.edit.request.send': function (msg) {
    return {
      accountNumber: msg.accountNumber,
      debit: 0,
      credit: msg.balance,
      name: msg.name,
      accountTypeId: 1,
      currencyId: 'TZS',
      isDisabled: msg.isDisabled
    }
  },
  'account.edit.response.receive': function (msg) {
    var account = msg[0]
    var baseUrl = util.get('baseUrl')
    if (account.length === 0) {
      throw error['ledger.account.edit.notFound']()
    }
    if (account.accountNumber.length === 0) {
      throw error['ledger.account.edit.invalidUriParameter']()
    }
    return {
      id: baseUrl + '/accounts/' + account.accountNumber,
      name: account.name,
      balance: account.balance,
      currency: account.currency,
      is_disabled: account.isDisabled
    }
  }
}
