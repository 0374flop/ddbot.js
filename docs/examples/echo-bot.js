// Пример писался под комит c453b96f9fd717375f5ff70525603b7e1491c290.

const { bot, botClassAndLoger, DebugLogger } = require('../../index');
const botdebug = botClassAndLoger.logDebuger;
botdebug.setDebugMode(true, true, true);

const logDebuger = new DebugLogger('example', true, true, null, true);

async function main() {
    logDebuger.logDebug('Main started');

    const identitybot = {
        name: "Towa",
        clan: "Towa Team",
        skin: "Astolfofinho",
        use_custom_color: 1,
        color_body: 16711680,
        color_feet: 16711680,
        country: -1
    };

    const botName = await bot.createBot('45.141.57.22:8375', 'Towa', {
        identity: identitybot,
        reconnect: true,
        reconnectAttempts: -1,
        randreconnect: true
    });

    bot.connectBot(botName); // подкюлчаем

    const botClient = bot.getBotClient(botName); // получаем оригинальный клиент neiky-ddracebot.js

    // Подписка на событие подключения
    bot.on(`${botName}:connect`, () => {
        let timemsg = 0; // время

        // подписка на чат
        bot.on(`${botName}:ChatNoSystem`, (msgraw, autormsg, text, team, client_id) => {
            logDebuger.logDebug(`${client_id} ${team} '${autormsg}' : ${text}`); // вывод чата в консоль
            if (text == 'exit') exit(); // выход

            // Эхо-логика
            if (Date.now() - timemsg > 6000) {
                timemsg = Date.now(); // устанавливаем текущее время
                if (text && autormsg) {
                    botClient.game.Say(`${autormsg}: ${text}`); // отправка сообения (neiky-ddracebot.js)
                }
            }
        });
    });

    // Выход через Ctrl+C
    async function exit() {
        logDebuger.logDebug('Shutting down...');
        await bot.disconnectAllBots(); // отключаем всех ботов
        process.exit(0); // завершаем процес
    }
    process.on('SIGINT', exit); // Ctrl+C
}

if (require.main === module) main();