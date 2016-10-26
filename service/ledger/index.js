module.exports = require('./resthooks')([
  require('./methods/getServerMeta'),
  require('./methods/transfer.hold'),
  require('./methods/transfer.execute'),
  require('./methods/transfer.get'),
  require('./methods/transfer.getFulfillment'),
  require('./methods/account.edit'),
  require('./methods/account.get')
])
