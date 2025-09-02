const { bot, autosendmessage } = require('./src/bot/index');

async function main() {
const botName = await bot.createAndConnectBot('45.141.57.31:8333', 'Towa', {
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
    }
)

const botClient = bot.getBotClient(botName)

bot.on(`${botName}:connect`, () => {
    const intervalemote = setInterval(() => {
        botClient.game.Emote(2);
    }, 5000);
    bot.on(`${botName}:disconnect`, () => {
        clearInterval(intervalemote);
        clearInterval(intervalMove);
        clearInterval(intervalTab2);
    });
});

const lastMessages = new Map();

bot.on(`${botName}:message`, (msg) => {
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
    console.log(`'${autormsg}' : ${text}`);

    setTimeout(() => {
        for (const [k, v] of lastMessages) {
            if (now - v.timestamp > 1000) {
                lastMessages.delete(k);
            }
        }
    }, 10000);
});

const intervalTab2 = setInterval(() => {
    const playerList = bot.getPlayerList(botName);
    const playerListnames = playerList.map(p => p.name);
    autosendmessage.setlist(playerListnames);
}, 1000);

autosendmessage.OnMessage(bot, botName)
let x = 100;
let direction = -1;
const intervalMove = setInterval(() => {
    x += direction * 10;
    if (x <= -100) {
        direction = 1;
    } else if (x >= 100) {
        direction = -1;
    }
    if (bot.isBotConnected(botName) && bot.isFreezeBot(botName)) {
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
    botClient.game.Say(message)
}

async function exit() {
    console.log('Shutting down...');
    await bot.disconnectAllBots();
    console.log('Main stopped');
    process.exit(0);
}

process.on('SIGINT', () => {
    exit();
});

}

console.log('Main started');
main();