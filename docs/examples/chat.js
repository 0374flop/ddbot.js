// Пример писался под комит c453b96f9fd717375f5ff70525603b7e1491c290.

const DebugLogger = require('loger0374'); // Подключаем логгер
const { bot, botClassAndLoger } = require('../../index'); // Подключаем бота (если подключаете с пакета, то ddbot.js-0374)
const botdebug = botClassAndLoger.logDebuger;
botdebug.setDebugMode(true, true, true);

const readline = require('readline');

// Создаем интерфейс для ввода с консоли
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '> '
});

function clearLastLine() {
    process.stdout.moveCursor(0, -1); // поднимаемся на одну строку вверх
    process.stdout.clearLine(0);      // очищаем всю строку
    process.stdout.cursorTo(0);       // возвращаем курсор в начало строки
}

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
        country: 804
    };

    const botName = await bot.createBot('45.141.57.22:8365', 'Towa', {
        identity: identitybot,
        reconnect: true,
        reconnectAttempts: -1,
        randreconnect: true
    });

    bot.connectBot(botName); // подкюлчаем

    const botClient = bot.getBotClient(botName); // получаем оригинальный клиент teeworlds

    // Подписка на событие подключения
    bot.on(`${botName}:connect`, () => {
        let timemsg = 0; // время

        rl.on('line', (input) => {
            const message = input.trim();

            if (message === 'exit') {
                exit();
                return;
            }

            if (message) {
                botClient.game.Say(message);
            }
        
            rl.prompt(); // Показываем prompt снова
        });

        // подписка на чат
        bot.on(`${botName}:ChatNoSystem`, (msgraw, autormsg, text, team, client_id) => {
            logDebuger.logDebug(`${client_id} ${team} '${autormsg}' : ${text}`); // вывод чата в консоль
            clearLastLine(); // очищаем последнюю строку ввода
            logDebuger.logDebug(`${client_id} ${team} '${autormsg}' : ${text}`); // повторно выводим сообщение
            if (text == 'exit') exit(); // выход
            rl.prompt();
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