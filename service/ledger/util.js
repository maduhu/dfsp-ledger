var util = {}
module.exports = {
  get: function (key) {
    return key ? util[key] : util
  },
  set: function (key, value) {
    util[key] = value
  },
  buildAccountResponse: function(account) {
    return {
      id: util.baseUrl + '/accounts/' + account.accountNumber,
      name: account.name,
      balance: account.balance,
      accountNumber: account.accountNumber,
      currencyCode: account.currencyCode,
      currencySymbol: account.currencySymbol,
      accountType: account.accountType,
      is_disabled: account.isDisabled,
      ledger: util.baseUrl
    }
  }
}
