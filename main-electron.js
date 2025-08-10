const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const bot = require('./src/bot/index');
const map = require('./src/map/index');
const { connectAIToBot, disconnectAIFromBot } = require('./src/AI/core/BotConnectpy');
const logger = require('./src/logger').getLogger('Electron');

async function main() {
    const botName = await bot.botCore.botManager.createAndConnectBot('45.141.57.31:8308', 'Towa', {
        identity: {
            name: "Towa",
            clan: "Towa Team",
            skin: "Astolfofinho",
            use_custom_color: 1,
            color_body: 16711680,
            color_feet: 16711680,
            country: -1
        },
        reconnect: true
    });

    const botClient = bot.botCore.botManager.getBotClient(botName);
    const botChatEmote = new bot.botCore.BotChatEmote(botClient);

    bot.botFeatures.autoSendConnect(botName, "hii! :3");

    bot.botCore.botManager.on(`${botName}:connect`, () => {
        const interval = setInterval(() => {
            botChatEmote.emote(2);
        }, 5000);

        // const intervalTab = setInterval(() => {
        //     logger.info(JSON.stringify(bot.botCore.botManager.getPlayerList(botName)));
        // }, 20000);

        bot.botCore.botManager.on(`${botName}:disconnect`, () => {
            clearInterval(interval);
            clearInterval(intervalMove);
            // clearInterval(intervalTab);
        });
    });

    const lastMessages = new Map();

    try {
        // map.Automaploader(botName, map.mapLoader)
    } catch (e) {
        logger.error(e);
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
        if (
            bot.botCore.botManager.isBotConnected(botName) &&
            bot.botCore.botManager.isFreezeBot(botName)
        ) {
            if (botClient && botClient.movement) {
                botClient.movement.FlagHookline(true);
                setTimeout(() => {
                    botClient.movement.FlagHookline(false);
                }, Math.random() * 50);
                botClient.movement.SetAim(x, -100);
            }
        }
    }, Math.random() * 100);

    async function SayChat(message) {
        const client = bot.botCore.botManager.getBotClient(botName);
        client.game.Say(message);
    }

    async function exit() {
        logger.info('Shutting down...');
        await bot.botCore.botManager.disconnectAllBots();
        logger.info('Elecnton stopped');
        process.exit(0);
    }

    function createWindow() {
        const win = new BrowserWindow({
            width: 800,
            height: 600,
            webPreferences: {
                preload: path.join(__dirname, 'preload.js')
            }
        });
        win.loadFile('index.html');

        win.on('close', (e) => {
            exit();
        });
    }

    ipcMain.on('html-data', (event, data) => {
        SayChat(data);
    });

    app.whenReady().then(createWindow);
}

logger.info('Electron started')
main();