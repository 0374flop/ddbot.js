const BotManager = require('./core/botManager');
const BotMovement = require('./core/BotMovement');
const BotChatEmote = require('./core/BotChat-emote');
const botManager = new BotManager();

module.exports = {
    BotManager,
    botManager,
    BotMovement,
    BotChatEmote
};