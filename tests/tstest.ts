import * as ddbot from '../lib/index.js'
//import * as loger from 'loger0374';

//const log = new loger.DebugLogger('record', true, true, undefined, true, { logfile: { path: 'D:\\proektiki\\ddbot.js\\tests\\test.log', autocreate: true } });

const bot = new ddbot.Bot(undefined, { timeout: 5000});

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

reconnect.start();

const [addr, port] = '45.141.57.22:8316'.split(':');
bot.on('connect', (Connection) => {
    console.log('Connection received:', Connection.addr+':'+Connection.port);
});
bot.on('disconnect', (reason, Connection) => {
    console.log('Disconnected from:', Connection.addr+':'+Connection.port, 'Reason:', reason);
});
reconnect.on('reconnected', (Connection) => {
    console.log('Reconnected to:', Connection.addr+':'+Connection.port);
});
reconnect.on('reconnect_failed', (reason, Connection) => {
    console.log('Failed to reconnect to:', Connection.addr+':'+Connection.port, 'Reason:', reason);
});
reconnect.on('reconnecting', (reconnectInfo) => {
    console.log('Reconnecting to:', reconnectInfo.addr+':'+reconnectInfo.port, 'Reason:', reconnectInfo.reason, 'Attempt:', reconnectInfo.attempt, 'Delay:', reconnectInfo.delay);
});

(async () => {
    await bot.connect(addr, parseInt(port), 10000);
    chat.start();
    console.log('Connected!');
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