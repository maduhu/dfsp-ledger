var joi = require('joi')
module.exports = {
  rest: function () {
    return {
      rpc: 'ledger.getAuthToken',
      path: '/ledger/auth_token',
      method: 'get',
      config: {
        description: 'Get Auth Token',
        notes: 'Get Auth Token',
        tags: ['api'],
        plugins: {
          'hapi-swagger': {
            responses: {
              '200': {
                description: 'Token was obtained successfully.',
                schema: joi.object({
                  token: joi.string().example('9AtVZPN3t49Kx07stO813UHXv6pcES')
                })
              }
            }
          }
        }
      }
    }
  },
  'getAuthToken': function () {
    return {
      'token': '9AtVZPN3t49Kx07stO813UHXv6pcES'
    }
  }
}
