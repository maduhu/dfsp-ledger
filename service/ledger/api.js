var joi = require('joi')
module.exports = {
  'account.add': {
    auth: false,
    description: 'Account add',
    notes: 'Account add',
    params: joi.any(),
    result: joi.any()
  },
  'account.edit': {
    auth: false,
    description: 'Account edit',
    notes: 'Account edit',
    params: joi.any(),
    result: joi.any()
  },
  'account.fetch': {
    auth: false,
    description: 'Account fetch',
    notes: 'Account fetch',
    params: joi.any(),
    result: joi.any()
  },
  'account.get': {
    auth: false,
    description: 'Account get',
    notes: 'Account get',
    params: joi.any(),
    result: joi.any()
  },
  'account.getConnector': {
    auth: false,
    description: 'Account getConnector',
    notes: 'Account getConnector',
    params: joi.any(),
    result: joi.any()
  },
  'account.remove': {
    auth: false,
    description: 'Account remove',
    notes: 'Account remove',
    params: joi.any(),
    result: joi.any()
  },
  'accountType.fetch': {
    auth: false,
    description: 'Account type fetch',
    notes: 'Account type fetch',
    params: joi.any(),
    result: joi.any()
  },
  'ministatement.get': {
    auth: false,
    description: 'Get ministatement',
    notes: 'Get ministatement',
    params: joi.any(),
    result: joi.any()
  },
  'quote.add': {
    auth: false,
    description: 'Quote add',
    notes: 'Quote add',
    params: joi.any(),
    result: joi.any()
  },
  'quote.get': {
    auth: false,
    description: 'Quote get',
    notes: 'Quote get',
    params: joi.any(),
    result: joi.any()
  },
  'transfer.execute': {
    auth: false,
    description: 'Transfer execute',
    notes: 'Transfer execute',
    params: joi.any(),
    result: joi.any()
  },
  'transfer.fetch': {
    auth: false,
    description: 'Transfer fetch',
    notes: 'Transfer fetch',
    params: joi.any(),
    result: joi.any()
  },
  'transfer.get': {
    auth: false,
    description: 'Transfer get',
    notes: 'Transfer get',
    params: joi.any(),
    result: joi.any()
  },
  'transfer.getFulfillment': {
    auth: false,
    description: 'Transfer getFulfillment',
    notes: 'Transfer getFulfillment',
    params: joi.any(),
    result: joi.any()
  },
  'transfer.hold': {
    auth: false,
    description: 'Transfer hold',
    notes: 'Transfer hold',
    params: joi.any(),
    result: joi.any()
  },
  'transfer.reject': {
    auth: false,
    description: 'Transfer reject',
    notes: 'Transfer reject',
    params: joi.any(),
    result: joi.any()
  },
  'transferType.fetch': {
    auth: false,
    description: 'Transfer type fetch',
    notes: 'Transfer type fetch',
    params: joi.any(),
    result: joi.any()
  }
}
