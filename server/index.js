module.exports = {
  ports: [
    require('../db'),
    require('../httpserver')
  ],
  modules: {
    ledger: require('../service/ledger')
  }
}
