module.exports = require('./resthooks')([
  require('./methods/getServerMeta'),
  require('./methods/getAuthToken'),
  require('./methods/transfer.hold'),
  require('./methods/transfer.execute'),
  require('./methods/transfer.reject'),
  require('./methods/transfer.get'),
  require('./methods/transfer.getFulfillment'),
  require('./methods/account.add'),
  require('./methods/account.edit'),
  require('./methods/account.get'),
  require('./methods/sql.inspect')
])
