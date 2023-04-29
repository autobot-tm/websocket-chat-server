const formatTime = require('date-format')

const createMsg = (msgText, username) => {
  return {
    msgText,
    username,
    createdAt: formatTime('dd/MM/yyyy - hh:mm:ss', new Date()),
  }
}

module.exports = {
  createMsg,
}
