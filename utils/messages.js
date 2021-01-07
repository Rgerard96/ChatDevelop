function formatMessage(username, message) {
  return {
    username,
    message,
    time: new Date()
  };
}

module.exports = formatMessage;
