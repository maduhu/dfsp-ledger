var create = require('ut-error').define
var defaultErrorCode = 400
module.exports = [
  // ledger
  {
    type: 'ledger',
    message: 'dfsp-ledger error'
  },
  // ledger.account
  {
    type: 'ledger.transfer',
    message: 'dfsp-ledger transfer error'
  },
  // ledger.account.hold
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
  // ledger.transfer.execute
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
    message: 'Unknown transfer.',
    statusCode: 404
  },
  {
    id: 'AlreadyExistsError',
    type: 'ledger.transfer.execute.alreadyExists',
    message: 'Can\'t modify transfer after execution.',
    statusCode: 422
  },
  // ledger.transfer.reject
  {
    type: 'ledger.transfer.reject',
    massage: 'ledger transfer.reject error'
  },
  {
    id: 'NotFoundError',
    type: 'ledger.transfer.reject.notFound',
    message: 'Unknown transfer.',
    statusCode: 404
  },
  {
    id: 'AlreadyExistsError',
    type: 'ledger.transfer.reject.alreadyExists',
    message: 'Can\'t modify transfer after rejection.',
    statusCode: 422
  },
  // ledger.transfer.get
  {
    type: 'ledger.transfer.get',
    message: 'ledger transfer.get error'
  },
  {
    id: 'NotFoundError',
    type: 'ledger.transfer.get.notFound',
    message: 'Unknown transfer',
    statusCode: 404
  },
  {
    id: 'InvalidUriParameterError',
    type: 'ledger.transfer.get.invalidUriParameter',
    message: 'id is not a valid Uuid'
  },
  // ledger.transfer.getFulfillment
  {
    type: 'ledger.transfer.getFulfillment',
    message: 'ledger transfer.getFulfillment error'
  },
  {
    id: 'NotFoundError',
    type: 'ledger.transfer.getFulfillment.notFound',
    message: 'Unknown transfer',
    statusCode: 404
  },
  {
    id: 'InvalidUriParameterError',
    type: 'ledger.transfer.getFulfillment.invalidUriParameter',
    message: 'id is not a valid Uuid'
  },
  // ledger.account
  {
    type: 'ledger.account',
    message: 'ledger account error'
  },
  // ledger.account.edit
  {
    type: 'ledger.account.add',
    message: 'ledger account.add error'
  },
  {
    id: 'UnauthorizedError',
    type: 'ledger.account.add.unauthorized',
    message: 'You do not have permissions to access this resource',
    statusCode: 403
  },
  {
    id: 'NotFoundError',
    type: 'ledger.account.add.notFound',
    message: 'Unknown account.',
    statusCode: 404
  },
  {
    id: 'InvalidUriParameterError',
    type: 'ledger.account.add.invalidUriParameter',
    message: 'One of the provided URI parameters was invalid'
  },
  {
    id: 'InvalidBodyError',
    type: 'ledger.account.add.invalidBody',
    message: 'The submitted JSON entity does not match the required schema'
  },
  // ledger.account.get
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
