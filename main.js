const bot = require('./src/bot/index');

bot.botManager.createAndConnectBot('45.141.57.22:8305', 'Urawa', {
    identity: {
        name: 'Urawa',
        clan: ".",
        skin: "",
        use_custom_color: 1,
        color_body: 16711680,
        color_feet: 16711680,
        country: -1
    },
    reconnect: true
});

const botMovement = new bot.BotMovement(bot.botManager.getBotClient('Urawa1'));
const botChatEmote = new bot.BotChatEmote(bot.botManager.getBotClient('Urawa1'));



setInterval(() => {
    console.log(bot.botManager.isBotConnected('Urawa1'));
    if (bot.botManager.isBotConnected('Urawa1')) {
        botMovement.runLeft();
        botChatEmote.say('Hello');
        botChatEmote.emote(1);
    }
}, 5000);

setTimeout(() => {
    bot.botManager.disconnectBot('Urawa1');
    setTimeout(() => {
        process.exit(0);
    }, 10000);
}, 50000);

process.on('SIGINT', () => {
    bot.botManager.disconnectAllBots();
    setTimeout(() => {
        process.exit(0);
    }, 10000);
});