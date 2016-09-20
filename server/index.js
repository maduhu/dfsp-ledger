module.exports = {
  ports: [
    require('../db'),
    require('../httpserver'),
    require('../script')
  ],
  modules: {
    ledger: require('../service/ledger'),
    identity: require('../service/identity')
  }
}
