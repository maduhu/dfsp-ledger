var util = require('../util')
module.exports = {
  'account.fetch.response.receive': function (msg, $meta) {
    var baseUrl = util.get('baseUrl')
    return msg.map((account) => {
      return {
        id: baseUrl + '/accounts/' + account.accountNumber,
        name: account.name,
        balance: account.balance,
        accountNumber: account.accountNumber,
        currencyCode: account.currencyCode,
        currencySymbol: account.currencySymbol,
        is_disabled: account.isDisabled,
        ledger: baseUrl
      }
    })
  }
}
