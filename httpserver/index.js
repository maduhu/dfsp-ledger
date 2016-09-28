var path = require('path')
module.exports = {
  id: 'httpserver',
  createPort: require('ut-port-httpserver'),
  logLevel: 'trace',
  baseUrl: 'http://localhost:8014',
  api: ['ledger'],
  port: 8014,
  bundle: 'ledger',
  dist: path.resolve(__dirname, '../dist'),
  imports: ['ledger.start'],
  routes: {
    rpc: {
      method: '*',
      path: '/rpc/{method?}',
      config: {
        auth: false
      }
    }
  }
}
