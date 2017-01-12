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
            accountNumber: joi.string().required().description('Account number')
          }
        },
        plugins: {
          'hapi-swagger': {
            responses: {
              '200': {
                description: 'Accounts fetched successfully.',
                schema: joi.array()
                  .items(
                    joi.object({
                      id: joi.string().example('/ledger/accounts/00001011'),
                      name: joi.string().example('alice1'),
                      balance: joi.string().example('1000'),
                      currency: joi.string().example('USD'),
                      is_disabled: joi.bool().example(false)
                    })
                  )
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
