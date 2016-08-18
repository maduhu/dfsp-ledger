module.exports = {
  id: 'db',
  createPort: require('ut-port-postgres'),
  createTT: false,
  retry: false,
  imports: [
    'ledger'
  ]
}
