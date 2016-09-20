/* eslint no-process-env: 0 */
module.exports = {
  server: require('../../server'),
  serverConfig: require('../../server/' + (process.env.UT_ENV || 'test')),
  client: require('../client'),
  clientConfig: require('../client/test')
}
