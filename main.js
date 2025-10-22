const { bot } = require('./index');
const botdebug = bot.getDebugLogger();
botdebug.setDebugMode(true, true)

async function main() {
    console.log('Main started');

    const identitybot = {
        name: "Towa",
        clan: "Towa Team",
        skin: "Astolfofinho",
        use_custom_color: 1,
        color_body: 16711680,
        color_feet: 16711680,
        country: -1
    };

    const botName = await bot.createAndConnectBot('57.128.201.180:8316', 'Towa', {
        identity: identitybot,
        reconnect: true,
        reconnectAttempts: -1
    });

    const botClient = bot.getBotClient(botName);

    bot.on(`${botName}:connect`, () => {
        function startemote(botClient, Emotenumber) {
            const intervalemote = setInterval(() => {
                botClient.game.Emote(Emotenumber);
            }, 5000);
            return intervalemote;
        }

        function startnameset(botClient, bot, identitybot) {
            const intervalnameset = setInterval(() => {
                const myclientid = botClient.SnapshotUnpacker.OwnID;
                const me = bot.getPlayerList(botName).find(p => p.client_id === myclientid);

                if (!me) return;

                 if (me.name !== identitybot.name) {
                    botClient.game.ChangePlayerInfo({ ...identitybot, name: identitybot.name });
                }
            }, 10000);
            return intervalnameset;
        }
        
        let sync = false;
        let intervalemote = startemote(botClient, 2);
        let intervalnameset = startnameset(botClient, bot, identitybot);

        async function startchatlistener(bot, botName) {
            const lastMessages = new Map();
            bot.on(`${botName}:ChatNoSystem`, (msg, autormsg, text, team, client_id) => {
                console.log(`${client_id} ${team} '${autormsg}' : ${text}`);

                if (text.includes(identitybot.name) && text.includes('%syncE')) {
                    sync = true;
                    if (intervalemote) clearInterval(intervalemote);
                    intervalemote = startemote(botClient, 2);
                }
            });
        }

        startchatlistener(bot, botName);

        bot.on(`${botName}:disconnect`, (reason) => {
            clearInterval(intervalemote);
            clearInterval(intervalMove);
            clearInterval(intervalnameset);
            console.log(reason)
        });

        function findbot2(botName, identitybot) {
            const players = bot.getPlayerList(botName);

            return players.some(player =>
                player.clan === identitybot.clan &&
                player.skin === identitybot.skin &&
                player.name.includes(identitybot.name) &&
                player.name !== identitybot.name
            );
        }
        
        setInterval(() => {
            if (findbot2(botName, identitybot) && !sync) {
                botClient.game.Say(botName+'%syncE');
            } if (!findbot2(botName, identitybot)) {
                sync = false;
            }
        }, 60000);
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
        botClient.game.Say(message);
    }

    async function exit() {
        console.log('Shutting down...');
        console.log('disconnecting...');
        await bot.disconnectAllBots();
        console.log('Main stopped');
        process.exit(0);
    }

    process.on('SIGINT', () => {
        exit();
    });

    module.exports.exit = exit;
    module.exports.SayChat = SayChat;
}

if (require.main === module) main();

module.exports.main = main;