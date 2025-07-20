const bot = require('./src/bot/index');

async function main() {
let botName;
async function botNameprint() {
    const botName2 = await bot.botCore.botManager.createAndConnectBot('57.128.201.180:8311', 'Urawa', {
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
    botName = botName2;
}

await botNameprint();

const botMovement = new bot.botCore.BotMovement(bot.botCore.botManager.getBotClient(botName));
const botChatEmote = new bot.botCore.BotChatEmote(bot.botCore.botManager.getBotClient(botName));

bot.botFeatures.autoSendConnect(botName, "hii! :3");

bot.botCore.botManager.on(`${botName}:connect`, () => {
    const interval = setInterval(() => {
        botChatEmote.emote(1);
    }, 1000);
    bot.botCore.botManager.on(`${botName}:disconnect`, () => {
        clearInterval(interval);
    });
});

// Movement code
let x = 100;
let direction = -1; // -1 для движения влево, 1 для движения вправо
setInterval(() => {
    // Плавное движение x от 100 до -100 и обратно
    x += direction * 10; // Скорость движения
    
    // Смена направления при достижении границ
    if (x <= -100) {
        direction = 1; // Двигаемся вправо
    } else if (x >= 100) {
        direction = -1; // Двигаемся влево
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

setTimeout(() => {
    bot.botCore.botManager.disconnectBot(botName);
    setTimeout(() => {
        process.exit(0);
    }, 10000);
}, 50000);

process.on('SIGINT', () => {
    bot.botCore.botManager.disconnectAllBots();
    setTimeout(() => {
        process.exit(0);
    }, 1000);
});

}

main();