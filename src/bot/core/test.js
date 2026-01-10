const Bot = require('./core');

(async () => {
const bot = new Bot({
    name: 'string',
    clan: 'string',
    skin: "string",
    use_custom_color: 1,
    color_body: 1,
    color_feet: 1,
    country: -1,
})
await bot.connect('26.230.124.233', 8303, 1222222);
const client = bot.bot_client;
console.log(JSON.stringify(client.movement, null, 2));
bot.disconnect();
console.log(JSON.stringify(client.movement, null, 2));
})();