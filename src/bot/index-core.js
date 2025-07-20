const BotManager = require('./core/botManager');
const BotMovement = require('./core/BotMovement');
const BotChatEmote = require('./core/BotChat-emote');

// Создаем экземпляр BotManager
const botManager = new BotManager();

module.exports = {
    BotManager,
    botManager,
    BotMovement,
    BotChatEmote
};