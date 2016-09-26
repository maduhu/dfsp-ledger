var create = require('ut-error').define

// var Ledger = create('ledger')
var AccountNotFound = create('accountNotFound')

var Unknown = create('UnknownError')
var InsufficientFunds = create('InsufficientFundsError')
var UnprocessableEntity = create('UnprocessableEntityError')
var AlreadyExists = create('AlreadyExistsError')
var InvalidUriParameter = create('InvalidUriParameterError')
var InvalidBody = create('InvalidBodyError')
var UnmetCondition = create('UnmetConditionError')
var NotFound = create('NotFoundError')

module.exports = {
  // ledger: function (cause) {
  //   return new Ledger(cause)
  // },
  accountNotFound: function (params) {
    return new AccountNotFound({
      message: 'Account not found',
      params: params
    })
  },

  unknown: function (params) {
    return new Unknown({
      message: 'Unknown error.',
      statusCode: 400,
      params: params
    })
  },
  insufficientFunds: function (params) {
    return new InsufficientFunds({
      message: 'Sender has insufficient funds.',
      statusCode: 422,
      params: params
    })
  },
  unprocessableEntity: function (params) {
    return new UnprocessableEntity({
      message: params.message,
      statusCode: 422,
      params: params
    })
  },
  alreadyExists: function (params) {
    return new AlreadyExists({
      message: 'Can\'t modify transfer after execution.',
      statusCode: 422,
      params: params
    })
  },
  InvalidUriParameter: function (params) {
    return new InvalidUriParameter({
      message: 'At least one provided URI or UUID parameter was invalid',
      statusCode: 400,
      params: params
    })
  },
  invalidBody: function (params) {
    return new InvalidBody({
      message: 'Body did not match schema',
      statusCode: 400,
      params: params
    })
  },
  unmetCondition: function (params) {
    return new UnmetCondition({
      message: 'Fulfillment does not match condition.',
      statusCode: 422,
      params: params
    })
  },
  notFound: function (params) {
    return new NotFound({
      message: params.message,
      statusCode: 404,
      params: params
    })
  }
}
