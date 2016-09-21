var seed = (Date.now() - 1463200000000) * 10000 // 1463200000000 is 14 May 2016
function next () {
  seed += 1
  return seed
}

module.exports = {
  /**
   * @return {number} Random number
   */
  generateRandomNumber: function () {
    return next()
  }
}
