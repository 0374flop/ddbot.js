const bot = require('./src/bot/index');
const map = require('./src/map/index');
const path = require('path');
const logger = require('./src/logger').getLogger('Main');

async function main() {
let botName;
async function botNameprint() {
    const botName2 = await bot.botCore.botManager.createAndConnectBot('57.128.201.180:8323', 'Urawa', {
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

async function mapLoader(mapName) {
    const isMapDownloaded = await map.MapDownloader.loadMap(mapName, map.MAPS_DIR);
    if (isMapDownloaded) {
        if (map.pyFather.isParsedMap(mapName, map.PARSED_DIR)) {
            logger.info('Map already parsed and loaded');
        } else {
            await map.pyFather.ParseMap(path.join(map.MAPS_DIR, `${mapName}.map`), path.join(map.PARSED_DIR, `${mapName}.json`));
            logger.info('Map downloaded and parsed');
        }
    } else {
        logger.info('Map be is not downloaded but download now');
        if (map.pyFather.isParsedMap(mapName, map.PARSED_DIR)) {
            logger.info('Map already parsed and loaded');
        } else {
            logger.info('Map not parsed but parsed now');
            await map.pyFather.ParseMap(path.join(map.MAPS_DIR, `${mapName}.map`), path.join(map.PARSED_DIR, `${mapName}.json`));
        }
    }
};

bot.botCore.botManager.on(`${botName}:map_details`, (mapDetails) => {
    const mapName = mapDetails.map_name;
    mapLoader(mapName);
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

function exit() {
    bot.botCore.botManager.disconnectAllBots();
    setTimeout(() => {
        logger.info('Main stopped');
        process.exit(0);
    }, 1000);
}

setTimeout(() => {
    exit();
}, 50000);

process.on('SIGINT', () => {
    exit();
});

}

logger.info('Main started');
main();