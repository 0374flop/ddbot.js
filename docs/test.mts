import * as ddbot from '../lib/index.js';

const bot = new ddbot.Bot(/* identity, options, custom teeworlds */);
// if no identity is provided, it will be default 'nameless tee' with default skin

bot.on('connect', () => {
    console.log('Connected to server!');
});

bot.on('disconnect', (reason) => {
    console.log('Disconnected from server!', reason);
});

(async () => {
    await bot.connect('26.230.124.233', 8303, 20000); // IP, port, timeout (IP is of ddnet server)
    bot.bot_client?.game.Say('DDNet!'); // from teeworlds
    setTimeout(async () => {
        await bot.disconnect();
        process.exit(0);
    }, 5000); // 5 sec

    process.on('SIGINT', async () => { // on Ctrl+C
        await bot.disconnect();
        process.exit(0);
    });
})();