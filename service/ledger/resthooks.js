var path = require('path')
var util = require('./util')
var error = require('./error')
// function uriToLedgerAccount (uri) {
//   var baseUrl = util.get('baseUrl')
//   var account = (typeof uri === 'string') && uri.split(baseUrl + '/accounts/')[1]
//   if (!account) {
//     throw error['ledger.transfer.hold.unprocessableEntity']({
//       uri: uri
//     })
//   }
//   return account
// }
function uriToLedgerAccount (uri) {
  return uri.split('/').pop()
}
function ledgerAccountToUri (accountNumber) {
  var baseUrl = util.get('baseUrl')
  return baseUrl + '/accounts/' + accountNumber
}
function buildTransferResource (transfer) {
  var baseUrl = util.get('baseUrl')
  var ledgerAccountToUri = util.get('ledgerAccountToUri')
  return {
    'id': baseUrl + '/transfers/' + transfer.id,
    'ledger': baseUrl,
    'debits': [{
      'account': ledgerAccountToUri(transfer.debitAccount),
      'memo': transfer.debitMemo,
      'amount': transfer.amount
    }],
    'credits': [{
      'account': ledgerAccountToUri(transfer.creditAccount),
      'memo': transfer.creditMemo,
      'amount': transfer.amount
    }],
    'execution_condition': transfer.executionCondition,
    'cancellation_condition': transfer.cancellationCondition,
    'state': transfer.state,
    'expires_at': transfer.expiresAt
  }
}
function validationFailHandler (request, reply, source, error) {
  var response = {}
  if (source === 'params') {
    response.id = 'InvalidUriParameterError'
    response.message = 'id is not a valid Uuid'
  } else {
    response.id = 'InvalidBodyError'
    response.message = 'Body did not match schema'
  }

  response.validationErrors = []
  error.data.details.forEach((err) => {
    response.validationErrors.push({
      message: err.message,
      params: err.context
    })
  })
  return reply(response)
}
function rest (request, reply, method, customReply) {
  // httpserver port should be bound (as this) in order for this method to work
  // Used in case header is "Content-Type: text/plain"
  var payload = {
    id: '1',
    jsonrpc: '2.0.',
    method: method
  }
  if (typeof request.payload === 'string') {
    payload.params = Object.assign({
      plainText: request.payload
    }, request.params)
  } else if (request.payload === null) {
    payload.params = Object.assign({}, request.params)
  } else {
    payload.params = Object.assign({}, request.payload, request.params)
  }
  request.payload = payload
  return this.handler(request, reply, customReply)
}
function defaultReply (reply, response, $meta) {
  if (!response.error) {
    return reply(response, {'content-type': 'application/json'}, $meta.successStatusCode)
  }
  // Handle required error format
  var errorBody = {}
  var statusCode
  if (!response.debug.isJsError) {
    var errorObject = (response.error && error[response.error.type] || error['ledger'])()
    errorBody.id = errorObject.id
    errorBody.type = errorObject.type
    errorBody.message = errorObject.message
    errorBody.params = errorObject.params || {}
    statusCode = errorObject.statusCode || 400
  } else {
    errorBody.id = response.debug.id
    errorBody.type = response.error.type
    errorBody.message = (response.debug.params && response.debug.params.message) || response.error.message
    statusCode = (response.debug && response.debug.statusCode) || 400
  }
  return reply(errorBody, {'content-type': 'application/json'}, statusCode)
}

module.exports = function (methods) {
  var hooks = {}
  methods.forEach(function (method) {
    Object.assign(hooks, Object.keys(method).reduce((methodHooks, prop) => {
      if (prop === 'rest') {
        return methodHooks
      }
      if (typeof method[prop] === 'function') {
        hooks[prop] = method[prop]
      }
      return methodHooks
    }, {}))
  })
  return Object.assign({
    start: function () {
      if (!this.registerRequestHandler) {
        return
      }
      // Register socket publish function
      var publish
      try {
        publish = this.registerSocketSubscription('/ledger/accounts/{account}/transfers')
      } catch (e) {
        publish = function noop () { }
      }
      // Expose utils to be used inside hooks & rest methods
      util.set('publish', publish)
      util.set('baseUrl', this.config.baseUrl)
      util.set('defaultReply', defaultReply)
      util.set('uriToLedgerAccount', uriToLedgerAccount)
      util.set('ledgerAccountToUri', ledgerAccountToUri)
      util.set('buildTransferResource', buildTransferResource)
      // Register routes & hooks
      var port = this
      methods.forEach(function (method) {
        if (!method.rest) {
          return
        }
        var route = method.rest()
        if (!route.reply) {
          route.reply = (reply, response, $meta) => {
            $meta.successStatusCode = route.successStatusCode || 200
            return defaultReply(reply, response, $meta)
          }
        }
        if (route.config && route.config.validate && !route.config.validate.failAction) {
          route.config.validate.failAction = validationFailHandler
        }
        port.registerRequestHandler({
          method: route.method,
          path: route.path,
          handler: (request, reply) => rest.call(port, request, reply, route.rpc, route.reply),
          config: Object.assign({
            auth: false
          }, route.config)
        })
      })
    },
    schema: [{
      path: path.join(__dirname, 'schema'),
      linkSP: true
    }]
  }, hooks)
}
