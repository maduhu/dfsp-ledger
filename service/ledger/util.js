var util = {}
module.exports = {
  get: function (key) {
    return key ? util[key] : util
  },
  set: function (key, value) {
    util[key] = value
  }
}
