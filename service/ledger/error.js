var create = require('ut-error').define

// var Ledger = create('ledger')
// var AccountNotFound = create('accountNotFound')

// var Unknown = create('UnknownError')
// var InsufficientFunds = create('InsufficientFundsError')
// var UnprocessableEntity = create('UnprocessableEntityError')
// var AlreadyExists = create('AlreadyExistsError')
// var InvalidUriParameter = create('InvalidUriParameterError')
// var InvalidBody = create('InvalidBodyError')
// var UnmetCondition = create('UnmetConditionError')
// var NotFound = create('NotFoundError')

// module.exports = {
//   // ledger: function (cause) {
//   //   return new Ledger(cause)
//   // },
//   accountNotFound: function (params) {
//     return new AccountNotFound({
//       message: 'Account not found',
//       params: params
//     })
//   },

//   unknown: function (params) {
//     return new Unknown({
//       message: 'Unknown error.',
//       statusCode: 400,
//       params: params
//     })
//   },
//   insufficientFunds: function (params) {
//     return new InsufficientFunds({
//       message: 'Sender has insufficient funds.',
//       statusCode: 422,
//       params: params
//     })
//   },
//   unprocessableEntity: function (params) {
//     return new UnprocessableEntity({
//       message: params.message,
//       statusCode: 422,
//       params: params
//     })
//   },
//   alreadyExists: function (params) {
//     return new AlreadyExists({
//       message: 'Can\'t modify transfer after execution.',
//       statusCode: 422,
//       params: params
//     })
//   },
//   InvalidUriParameter: function (params) {
//     return new InvalidUriParameter({
//       message: 'At least one provided URI or UUID parameter was invalid',
//       statusCode: 400,
//       params: params
//     })
//   },
//   invalidBody: function (params) {
//     return new InvalidBody({
//       message: 'Body did not match schema',
//       statusCode: 400,
//       params: params
//     })
//   },
//   unmetCondition: function (params) {
//     return new UnmetCondition({
//       message: 'Fulfillment does not match condition.',
//       statusCode: 422,
//       params: params
//     })
//   },
//   notFound: function (params) {
//     return new NotFound({
//       message: params.message,
//       statusCode: 404,
//       params: params
//     })
//   }
// }

var defaultErrorCode = 400
module.exports = [
  {
    type: 'ledger',
    message: 'dfsp-ledger error'
  },
  {
    type: 'ledger.transfer',
    message: 'dfsp-ledger transfer error'
  },
  {
    type: 'ledger.transfer.hold',
    message: 'dfsp-ledger transfer-hold error'
  },
  {
    id: 'InsufficientFundsError',
    type: 'ledger.transfer.hold.insufficientFunds',
    message: 'Sender has insufficient funds',
    statusCode: 422
  },
  {
    id: 'UnprocessableEntityError',
    type: 'ledger.transfer.hold.unprocessableEntity',
    message: 'Account `unknown` does not exist',
    statusCode: 422
  },
  {
    id: 'AlreadyExistsError',
    type: 'ledger.transfer.hold.alreadyExists',
    message: 'Can\'t modify transfer after execution.',
    statusCode: 422
  },
  {
    id: 'InvalidUriParameterError',
    type: 'ledger.transfer.hold.invalidUriParameter',
    message: 'id is not a valid Uuid'
  },
  {
    id: 'InvalidBodyError',
    type: 'ledger.transfer.hold.invalidBody',
    message: 'Body did not match schema'
  },
  {
    type: 'ledger.transfer.execute',
    massage: 'ledger transfer.execute error'
  },
  {
    id: 'UnmetConditionError',
    type: 'ledger.transfer.execute.unmetCondition',
    message: 'Fulfillment does not match condition',
    statusCode: 422
  },
  {
    id: 'UnprocessableEntityError',
    type: 'ledger.transfer.execute.unprocessableEntity',
    message: 'Debits and credits are not equal',
    statusCode: 422
  },
  {
    id: 'InvalidUriParameterError',
    type: 'ledger.transfer.execute.invalidUriParameter',
    message: 'id is not a valid Uuid'
  },
  {
    id: 'InvalidBodyError',
    type: 'ledger.transfer.execute.invalidBody',
    message: 'Body did not match schema'
  },
  {
    id: 'NotFoundError',
    type: 'ledger.transfer.execute.notFound',
    message: 'Unknown transfer.'
  },
  {
    id: 'AlreadyExistsError',
    type: 'ledger.transfer.execute.alreadyExists',
    message: 'Can\'t modify transfer after execution.',
    statusCode: 422
  },
  {
    type: 'ledger.transfer.get',
    message: 'ledger transfer.get error'
  },
  {
    id: 'NotFoundError',
    type: 'ledger.transfer.get.notFound',
    message: 'Unknown transfer'
  },
  {
    id: 'InvalidUriParameterError',
    type: 'ledger.transfer.get.invalidUriParameter',
    message: 'id is not a valid Uuid'
  },
  {
    type: 'ledger.transfer.getFulfillment',
    message: 'ledger transfer.getFulfillment error'
  },
  {
    id: 'NotFoundError',
    type: 'ledger.transfer.getFulfillment.notFound',
    message: 'Unknown transfer'
  },
  {
    id: 'InvalidUriParameterError',
    type: 'ledger.transfer.getFulfillment.invalidUriParameter',
    message: 'id is not a valid Uuid'
  },
  {
    type: 'ledger.account',
    message: 'ledger account error'
  },
  {
    type: 'ledger.account.edit',
    message: 'ledger account.edit error'
  },
  {
    id: 'UnauthorizedError',
    type: 'ledger.account.edit.unauthorized',
    message: 'You do not have permissions to access this resource',
    statusCode: 403
  },
  {
    id: 'NotFoundError',
    type: 'ledger.account.edit.notFound',
    message: 'Unknown account.',
    statusCode: 404
  },
  {
    id: 'InvalidUriParameterError',
    type: 'ledger.account.edit.invalidUriParameter',
    message: 'One of the provided URI parameters was invalid'
  },
  {
    id: 'InvalidBodyError',
    type: 'ledger.account.edit.invalidBody',
    message: 'The submitted JSON entity does not match the required schema'
  },
  {
    type: 'ledger.account.get',
    message: 'dfsp-ledger account.get error'
  },
  {
    id: 'NotFoundError',
    type: 'ledger.account.get.notFound',
    message: 'Unknown account.',
    statusCode: 404
  },
  {
    id: 'InvalidUriParameterError',
    type: 'ledger.account.get.invalidUriParameter',
    message: 'One of the provided URI parameters was invalid'
  }
].reduce((exporting, error) => {
  var typePath = error.type.split('.')
  var Ctor = create(typePath.pop(), typePath.join('.'), error.message)
  /**
   * Exceptions thrown from the db procedures will not execute this function
   * It will only be executed if an error is throw from JS
   */
  exporting[error.type] = function (params) {
    return new Ctor({
      isJsError: true,
      params: params,
      statusCode: error.statusCode || defaultErrorCode,
      id: error.id || error.type
    })
  }
  return exporting
}, {})
