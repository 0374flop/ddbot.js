const bot = require('./src/bot/index');
const map = require('./src/map/index');
const path = require('path');
const logger = require('./src/logger').getLogger('Main');
const { connectAIToBot, disconnectAIFromBot } = require('./src/AI/core/BotConnectpy');

async function main() {
let botName;
async function botNameprint() {
    const botName2 = await bot.botCore.botManager.createAndConnectBot('45.141.57.22:8309', 'Towa', {
        identity: {
            clan: "Towa Team",
            skin: "Astolfofinho",
            use_custom_color: 1,
            color_body: 16711680,
            color_feet: 16711680,
            country: -1
        },
        reconnect: true
    });
    botName = botName2;
}

await botNameprint();

const botMovement = new bot.botCore.BotMovement(bot.botCore.botManager.getBotClient(botName));
const botChatEmote = new bot.botCore.BotChatEmote(bot.botCore.botManager.getBotClient(botName));

bot.botFeatures.autoSendConnect(botName, "hii! :3");

bot.botCore.botManager.on(`${botName}:connect`, () => {
    const interval = setInterval(() => {
        botChatEmote.emote(2);
    }, 5000);
    bot.botCore.botManager.on(`${botName}:disconnect`, () => {
        clearInterval(interval);
    });
});

map.Automaploader(botName, map.mapLoader);

bot.botCore.botManager.on(`${botName}:message`, (msg) => {
    const utilisateur = msg.utilisateur?.InformationDuBot;
    let autormsg = utilisateur?.name || false;
    const text = msg.message.trim();
    if (msg && typeof msg.message === 'string') {
        if (!autormsg) autormsg = "system";
        logger.info(`'${autormsg}' : ${text}`)
    } else {
        return;
    }
});

let x = 100;
let direction = -1;
setInterval(() => {
    x += direction * 10;
    if (x <= -100) {
        direction = 1;
    } else if (x >= 100) {
        direction = -1;
    }
    if (bot.botCore.botManager.isBotConnected(botName) && bot.botCore.botManager.isFreezeBot(botName)) {
        const botClient = bot.botCore.botManager.getBotClient(botName);
        if (botClient && botClient.movement) {
            botClient.movement.FlagHookline(true);
            setTimeout(() => {
                botClient.movement.FlagHookline(false);
            }, Math.random() * 50);
            botClient.movement.SetAim(x, -100);
        }
    }
}, Math.random() * 100);

async function exit() {
    logger.info('Shutting down...');
    await bot.botCore.botManager.disconnectAllBots();
    logger.info('Main stopped');
    process.exit(0);
}

process.on('SIGINT', () => {
    exit();
});

}

logger.info('Main started');
main();