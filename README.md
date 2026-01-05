Смотрите за руками

Создатель такой никто под именем 0374flop

Скажу прямо.
Коментари с нецензурной лексикой и тут и в коде только потому что я за то чтобы цензура стала слабее. Мне не нравиться что везде слишком сильная цензура.
Так что да, не плакайте там.
Простите за орфографические ошибки, писал на скорую руку. (за другие ошибки простите тоже)


Ето модуль для роботы с ДДНет (DDNet/teeworlds) ботами. Внутри изпользует чистую библиотеку teeworlds (https://www.npmjs.com/package/teeworlds, https://www.npmjs.com/~swarfey) и просто делает рутинные вещи за вас. Например, может работать с кучей ботов на разных серверах, делает чат не повторяющимся без спамов. Убирает системные сообщения из чата. Можно получить весь список игроков одним методом.

Вообще я делал его для себя, и по приколу. Но решил выложить чтобы проще работать с зависимостями и не качать с гита.

Лицензия находиться в файле "LICENSE" там большими буквами для идиотов написано ( MIT )

У нас есть много всякого, например:
1. bot.js
    Начнем с него.
    Ето класс, с методами для работы с большим количеством ботов.
    Работает с дебагером.
    Емитит кастомные емиты
    и там всякое которое мне лень разказывать
2. index'ы.js
    просто вещи чтобы проще было.
    что про них сказать?
    подключают из других файлов все, и выгружают все в один объект.

## Установка.
Так как я только что первый раз зделал нпм пакет то теперь его можно поставить как пакет
Вот так `npm i ddbot.js-0374`
Делаем require('ddbot.js-0374')
И все после етого вам доступно все ето : { bot, botClassAndLoger }.
Наслаждайтесь етом дерьмом.

## Техническая документация.
### bot/BotManager
Окей...
Сейчас я вам разкажу как работает bot/BotManager.

teeworlds
#### Методы
У нас есть :
1. bot.createBot()
	1. fulladdress - Полный адрес сервера (IP:порт)
	2. botName - Имя бота
	3. parameter - Параметры бота
	    1. identity со скином и другими косметическими деталями.
	    2. reconnect переподключаеться бот или нет
	    3. reconnectAttempts количество возможных реконектов (-1 для безконечного)
	    4. randreconnect будет ли бот переключаться с чуть разной задержкой или нет (в районе 0 - 1 сек)
	- На выходе у нас имя бота по которому можно обращаться. (Уникальное имя бота или null в случае ошибки)
2. bot.connectBot()
    1. Принимает уникальное имя бота и подключает нужного.
    - На выхоте булевое значение (нет точных данных подключился ли бот или нет)
3. bot.disconnectBot()
    1. Принимает уникальное имя бота и отключает нужного.
    - Работает также как и connectBot().
4. bot.disconnectAllBots()
    Отключает всех ботов, не принимает аргументов.
    Под капотом disconnectBot().
5. bot.getBotInfo()
    1. Принимает уникальное имя бота и возвращает информацию про него.
    - Информация о боте или null, если бот не найден
6. bot.isBotConnected()
    1. Принимает уникальное имя бота.
    - Возвращает булевое значение.
7. bot.isFreezeBot()
    1. Принимает уникальное имя бота.
    - Возвращает булевое значение.
8. bot.setFreezeBot()
    Просто меняет значение того заморожен ли бот. (не влияет на игру)
9. bot.getAllActiveBots()
	Получение всех активных ботов
	- Массив имен всех активных ботов
10. bot.getBotClient()
    1. Принимает уникальное имя бота.
    - Возвращает клиент teeworlds
11. bot.removeBot()
	Удаляет бота полностью. (и отключает)
    1. Принимает уникальное имя бота.
    - Возвращает булевое значение.
12. bot.getBot()
    1. Принимает уникальное имя бота.
    - Возвращает прокси-объект бота.
13. bot._setupBotEvents()
    Заставляет ивенты работать. Изпользуеться в bot.createBot() чтобы вы могли делать все проще и вам не нужно было получать оригинальный клиент teeworlds для ивентов.
    1. Принимает уникальное имя бота.
    2. Принимает клиент teeworlds
    Ничего не возвращает.
14. bot.getPlayerList()
    1. Принимает уникальное имя бота.
    - Array список игроков.
15. bot.getPlayerName()
    1. Принимает уникальное имя бота/Array список игроков.
    2. clientid нужного игрока.
    - Имя нужного игрока.

#### пример ехо бота
```js
// Пример писался под комит c453b96f9fd717375f5ff70525603b7e1491c290.

const DebugLogger = require('loger0374'); // мой логер (не обязательно изпользовать)
const { bot, botClassAndLoger } = require('../../index');
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
        country: 804
    };

    const botName = await bot.createBot('45.141.57.22:8311', 'Towa', {
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

        setTimeout(() => {
            botClient.game.Say('Ку всем');
        }, 1251);

        // подписка на чат
        bot.on(`${botName}:ChatNoSystem`, (msgraw, autormsg, text, team, client_id) => {
            logDebuger.logDebug(`${client_id} ${team} '${autormsg}' : ${text}`); // вывод чата в консоль
            if (text == 'exit') exit(); // выход

            // Эхо-логика
            if (Date.now() - timemsg > 6000) {
                timemsg = Date.now(); // устанавливаем текущее время
                if (text && autormsg) {
                    botClient.game.Say(`${autormsg}: ${text}`); // отправка сообения (teeworlds)
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
```
