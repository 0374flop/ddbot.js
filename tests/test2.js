import * as ddbot from '../lib/index.js';
const { Bot } = ddbot;
const { Chat, PlayerList, Reconnect, Snap } = ddbot.StandardModules;

import ddmaster from 'ddmaster';

function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

(async () => {
    const nameman = 'Towa';
    const servers = await ddmaster.findDDNetPlayerByName(nameman);
    const serverAddresses = await ddmaster.getDDNetServers(servers);
    let server;
    if (serverAddresses.length === 0) {
        console.log(`Игрок ${nameman} не найден на серверах ДДНета.`);
        process.exit();
    } else {
        console.log(`Игрок ${nameman} найден на серверах:`, serverAddresses);
        server = serverAddresses[0];
    }

    const bot = new Bot({
        name: 'string',
        clan: 'string',
        skin: "string",
        use_custom_color: 1,
        color_body: 1,
        color_feet: 1,
        country: -1,
    });

    const chat = new Chat(bot);
    chat.start(1000, 1500);

    const playerlist = new PlayerList(bot);
    playerlist.start();

    const snap = new Snap(bot);

    var [addr, port] = server.split(':');
    await bot.connect(addr, Number(port), 10000);
    console.log('подключено');

    const client = bot.bot_client;

    snap.start();

    chat.on('anychat', async (msgraw, autormsg, text, team, client_id) => {
        console.log(autormsg ? client_id+": "+autormsg+":" : '***', text);
        if (text == 'exit') {
            await bot.disconnect();
            process.exit();
        }
    });

    const Aaa = ['Ай!', "Ух!", "Ой!", "А!", "Аа!", "Ох!"]

    snap.on('hammerhitme', (hit, who) => {
        try {
            console.log('Удар молотком по мне!', hit, who);
            chat.send(Aaa[random(0, Aaa.length - 1)]);
        } catch (error) {
            console.error(error)
        }
    });

    snap.on('fire', (common, id) => {
        try {
            console.log('Выстрел', common, id);
        } catch (error) {
            console.error(error)
        }
    });

    process.stdin.on('data', (data) => {
        client.game.Say(data.toString());
    });

    bot.on('disconnect', (reason, info) => {
        //if (reason !== null) 
            console.log('отключено:', reason, info);
    });

    process.on('SIGINT', async () => {
        await bot.disconnect();
        console.log('завершено');
        process.exit();
    });
})().catch((reason) => {
    console.error(reason);
    console.log('завершено');
    process.exit()
});