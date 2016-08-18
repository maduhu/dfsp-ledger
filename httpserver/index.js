var cloneDeep = require('lodash.clonedeep')

var path = require('path')
module.exports = {
  id: 'httpserver',
  createPort: require('ut-port-httpserver'),
  logLevel: 'trace',
  api: ['ledger'],
  port: 8014,
  bundle: 'ledger',
  dist: path.resolve(__dirname, '../dist'),
  routes: {
    rpc: {
      method: '*',
      path: '/rpc/{method?}',
      config: {
        auth: false
      }
    }
  },
  start: function () {
    var port = this

    function rest (request, reply, method) {
      request.payload = cloneDeep(request.params)
      request.params.method = method
      return port.handler(request, reply)
    }

    var routes = [
      { rpc: 'ledger.account.get', path: '/ledger/accounts/{accountNumber}', method: 'get' },
      { rpc: 'ledger.account.edit', path: '/ledger/accounts/{accountNumber}', method: 'put' },
      { rpc: 'ledger.connectors.get', path: '/ledger/connectors', method: 'get' },
      { rpc: 'ledger.transfer.hold', path: '/ledger/transfers/{id}', method: 'put' },
      { rpc: 'ledger.transfer.get', path: '/ledger/transfers/{id}', method: 'get' },
      { rpc: 'ledger.transfer.getFulfillment', path: '/ledger/transfers/{id}/fulfillment', method: 'get' },
      { rpc: 'ledger.transfer.getState', path: '/ledger/transfers/{id}/state', method: 'get' },
      { rpc: 'ledger.transfer.execute', path: '/ledger/transfers/{transferId}/fulfillment/{fulfillmentId}', method: 'put' }
    ].map((route) => {
      return {
        method: route.method,
        path: route.path,
        handler: (request, reply) => rest(request, reply, route.rpc),
        config: { auth: false }
      }
    })

    this.registerRequestHandler(routes)
  }
}
