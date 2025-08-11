const BotManager = require('./botManager');
const autoSendConnect = require('./auto-send-connect');

const bot = new BotManager()
module.exports = {
    bot,
    autoSendConnect
};