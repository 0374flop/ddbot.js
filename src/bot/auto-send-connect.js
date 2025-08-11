const bot = require('../index-core');

async function autoSendConnect(botName, message) {
    const botChatEmote = new bot.BotChatEmote(bot.botManager.getBotClient(botName));

    bot.botManager.on(`${botName}:connect`, () => {
        botChatEmote.say(message);
    });
}

module.exports = autoSendConnect;