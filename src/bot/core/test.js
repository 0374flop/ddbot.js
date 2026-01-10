const Bot = require('./core');
const Chat = require('../chat');

(async () => {
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
    chat.start()
    await bot.connect('26.230.124.233', 8303, 1222222);
    const client = bot.bot_client;
    chat.on('chat', (msgraw, autormsg, text, team, client_id) => {
        console.log(autormsg ? autormsg : 'system', text)
        if (text == 'exit') bot.disconnect();
    })
})();