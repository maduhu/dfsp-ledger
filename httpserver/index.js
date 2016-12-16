var path = require('path')
module.exports = {
  id: 'httpserver',
  createPort: require('ut-port-httpserver'),
  logLevel: 'trace',
  baseUrl: 'http://localhost:8014/ledger',
  api: ['ledger'],
  bundle: 'ledger',
  dist: path.resolve(__dirname, '../dist'),
  validationPassThrough: true,
  imports: ['ledger.start'],
  connections: [{
    port: 8014,
    router: {
      stripTrailingSlash: true
    }
  }],
  routes: {
    rpc: {
      method: '*',
      path: '/rpc/{method?}',
      config: {
        tags: ['rpc'],
        auth: false
      }
    }
  }
}
