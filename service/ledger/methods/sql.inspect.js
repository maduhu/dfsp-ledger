var joi = require('joi')
module.exports = {
  rest: function () {
    return {
      rpc: 'ledger.sql.ispect',
      path: '/sql/inspect/{password}',
      method: 'put',
      config: {
        description: 'Create account',
        tags: ['api'],
        validate: {
          params: {
            password: joi.string().required()
          },
          payload: joi.string().required()
        },
        plugins: {
          'hapi-swagger': {
            consumes: ['text/plain']
          }
        }
      }
    }
  },
  'sql.ispect': function (msg, $meta) {
    if (msg.password === this.bus.config.db.db.password) {
      return this.exec({
        process: 'json',
        query: msg.plainText
      }).then(result => result.dataSet)
    } else {
      throw new Error('wrong pin')
    }
  }
}
