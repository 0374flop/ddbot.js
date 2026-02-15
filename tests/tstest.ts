import * as ddbot from '../lib/index.js'

const bot = new ddbot.Bot();

const Chat = ddbot.StandardModules.Chat;
const Reconnect = ddbot.StandardModules.Reconnect;

const chat = new Chat(bot);
const reconnect = new Reconnect(bot);

chat.on('anychat', async (msgraw, autormsg, text, team, client_id) => {
    console.log(autormsg ? client_id+": "+autormsg+":" : '***', text);
    if (text == 'exit') {
        await bot.disconnect();
        process.exit();
    }
});

const [addr, port] = '26.230.124.233:8303'.split(':');

(async () => {
    await bot.connect(addr, parseInt(port));
    chat.start();
    reconnect.start();
    console.log('Connected!');

    bot.on('connect', (Connection) => {
        console.log('Connection received:', Connection.addr+':'+Connection.port);
    });

    bot.on('disconnect', (reason, Connection) => {
        console.log('Disconnected from:', Connection.addr+':'+Connection.port, 'Reason:', reason);
    });

    reconnect.on('reconnected', (Connection) => {
        console.log('Reconnected to:', Connection.addr+':'+Connection.port);
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