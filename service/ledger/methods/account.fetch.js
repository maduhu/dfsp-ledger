var joi = require('joi')
module.exports = {
  rest: function () {
    return {
      rpc: 'ledger.account.fetch',
      path: '/ledger/accounts/fetch/{accountNumber}',
      method: 'get',
      config: {
        description: 'Fetch ledger account',
        notes: 'Receive information about ledger accounts.',
        tags: ['api'],
        validate: {
          params: {
            accountNumber: joi.string().required()
          }
        },
        plugins: {
          'hapi-swagger': {
            responses: {
              '200': {
                description: 'Transfer was executed successfully.',
                schema: joi.object()
              }
            }
          }
        }
      }
    }
  },
  'account.fetch.response.receive': function (msg, $meta) {
    return msg
  }
}
