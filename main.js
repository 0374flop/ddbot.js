const bot = require('./src/bot/index');
const map = require('./src/map/index');
const path = require('path');
const logger = require('./src/logger').getLogger('Main');
const { connectAIToBot, disconnectAIFromBot } = require('./src/AI/core/BotConnectpy');

async function main() {
const botName = await bot.botCore.botManager.createAndConnectBot('45.141.57.31:8308', 'Towa', {
        identity: {
            clan: "Towa Team",
            skin: "Astolfofinho",
            use_custom_color: 1,
            color_body: 16711680,
            color_feet: 16711680,
            country: -1
        },
        reconnect: true
    }
)

const botClient = bot.botCore.botManager.getBotClient(botName)

const botMovement = new bot.botCore.BotMovement(botClient);
const botChatEmote = new bot.botCore.BotChatEmote(botClient);

bot.botFeatures.autoSendConnect(botName, "hii! :3");

bot.botCore.botManager.on(`${botName}:connect`, () => {
    const interval = setInterval(() => {
        botChatEmote.emote(2);
    }, 5000);
    const intervalTab = setInterval(() => {
        logger.info(JSON.stringify(bot.botCore.botManager.getPlayerList(botName)));
    }, 20000)
    bot.botCore.botManager.on(`${botName}:disconnect`, () => {
        clearInterval(interval);
        clearInterval(intervalMove);
        clearInterval(intervalTab);
    });
});

const lastMessages = new Map();

try{
    // map.Automaploader(botName, map.mapLoader)
} catch (e) {
    logger.error(e)
}

bot.botCore.botManager.on(`${botName}:message`, (msg) => {
    if (!msg || typeof msg.message !== 'string') {
        return;
    }

    const text = msg.message.trim();
    const clientId = msg.client_id;
    const team = msg.team;
    const key = `${clientId}:${team}:${text}`;
    const now = Date.now();

    const lastMessage = lastMessages.get(key);
    if (lastMessage && now - lastMessage.timestamp < 100) {
        return;
    }

    lastMessages.set(key, { timestamp: now });

    const utilisateur = msg.utilisateur?.InformationDuBot;
    let autormsg = utilisateur?.name || "system";
    logger.info(`'${autormsg}' : ${text}`);

    setTimeout(() => {
        for (const [k, v] of lastMessages) {
            if (now - v.timestamp > 1000) {
                lastMessages.delete(k);
            }
        }
    }, 10000);
});

let x = 100;
let direction = -1;
const intervalMove = setInterval(() => {
    x += direction * 10;
    if (x <= -100) {
        direction = 1;
    } else if (x >= 100) {
        direction = -1;
    }
    if (bot.botCore.botManager.isBotConnected(botName) && bot.botCore.botManager.isFreezeBot(botName)) {
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