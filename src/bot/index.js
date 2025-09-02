const BotManager = require('./bot');
const bot = new BotManager();
const autosendmessage = require('./autosendmessage');

module.exports = { bot, autosendmessage };