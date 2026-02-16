import * as ddbot from '../lib/index.js'
import * as loger from 'loger0374';

const log = new loger.DebugLogger('record', true, true, undefined, true, { logfile: { path: 'D:\\proektiki\\ddbot.js\\tests\\test.log', autocreate: true } });

const bot = new ddbot.Bot();

const Chat = ddbot.StandardModules.Chat;
const Reconnect = ddbot.StandardModules.Reconnect;

const chat = new Chat(bot);
const reconnect = new Reconnect(bot);

chat.on('anychat', async (msgraw, autormsg, text, team, client_id) => {
    log.log(autormsg ? client_id+": "+autormsg+":" : '***', text);
    if (text == 'exit') {
        await bot.disconnect();
        process.exit();
    }
});

reconnect.start();

const [addr, port] = '45.141.57.22:8316'.split(':');

(async () => {
    await bot.connect(addr, parseInt(port)).catch((reason) => {});
    chat.start();
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