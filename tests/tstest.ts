import * as ddbot from '../lib/index.js'

const bot = new ddbot.Bot({
    name: '1234'
});

const Chat = ddbot.StandardModules.Chat;

const chat = new Chat(bot);

chat.on('anychat', async (msgraw, autormsg, text, team, client_id) => {
    console.log(autormsg ? client_id+": "+autormsg+":" : '***', text);
    if (text == 'exit') {
        await bot.disconnect();
        process.exit();
    }
});

const [addr, port] = '45.141.57.22:8324'.split(':');

(async () => {
    await bot.connect(addr, parseInt(port));
    chat.start()
    console.log('Connected!');

    bot.on('connect', (Connection) => {
        console.log('Connection received:', Connection.addr+':'+Connection.port);
    });
})().catch(async (reason) => {
    console.error(reason);
    await bot.disconnect();
    process.exit();
})

process.on('SIGINT', async () => {
    console.log('Disconnecting...');
    await bot.disconnect();
    process.exit();
});