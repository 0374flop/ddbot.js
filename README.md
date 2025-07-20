# DDNet Bot Manager

Упрощенный менеджер ботов для DDNet серверов с системой событий.

## Структура проекта

```
ddbot.js/
├── src/
│   └── bot/
│       └── core/
│           ├── botManager.js    # Единый класс для управления ботами
│           ├── BotMovement.js   # API для управления движением
│           └── BotChat-emote.js # API для чата и эмоций
├── example.js                   # Пример использования
├── package.json
└── README.md
```

## Использование

### Через BotManager (рекомендуется):

```javascript
const { BotManager } = require('./src/bot/index');

const botManager = new BotManager();

// Создание и подключение бота
const botName = await botManager.createAndConnectBot(
    '127.0.0.1:8303', 
    'MyBot', 
    { 
        identity: 'my-identity',
        reconnect: true  // Включить автоматическое переподключение
    }
);

// Получение объекта бота с событиями
const bot = botManager.getBot(botName);

// Настройка обработчиков событий
bot.on('connect', () => {
    console.log('🎉 Bot connected!');
});

bot.on('disconnect', (reason) => {
    console.log('😢 Bot disconnected:', reason);
});

bot.on('message', (msg) => {
    console.log('💬 Received message:', msg);
});

// Управление ботом
await bot.connect();
await bot.disconnect();
// Переподключение происходит автоматически при отключении, если включено в параметрах

// Проверка статуса
console.log(bot.isConnected());

// Управление движением
const movement = bot.movement;
movement.runLeft();
movement.jump();

// Управление чатом и эмоциями
const chat = bot.chat;
chat.say('Hello!');
chat.happy();
chat.startAutoEmote();

// Прямое управление движением
movement.runLeft();
movement.jump(true);
movement.setAim(100, 200);
```

### Прямое использование BotMovement:

```javascript
const { BotMovement } = require('./src/bot/index');
const DDRaceBot = require('neiky-ddracebot.js');

// Создаем клиент
const client = new DDRaceBot.Client('127.0.0.1', 8303, 'MyBot');

// Создаем объект движения
const movement = new BotMovement(client);

// Используем API
movement.runLeft();
movement.jump();

// Создаем объект чата
const chat = new BotChatEmote(client);
chat.say('Hello!');
chat.happy();
```

## Система событий

### Доступные события:

- `connect` / `connected` - бот подключился к серверу
- `disconnect` / `disconnected` - бот отключился от сервера
- `message` / `chat` - получено сообщение в чате
- `snapshot` - получен снапшот игры
- `error` - произошла ошибка
- `close` - соединение закрыто

### Методы событий:

- `bot.on(event, callback)` - подписка на событие
- `bot.off(event, callback)` - отписка от события
- `bot.once(event, callback)` - одноразовая подписка

## Параметры бота

При создании бота можно передать следующие параметры:

```javascript
{
    identity: 'my-identity',  // Идентификатор бота
    reconnect: true           // Автоматическое переподключение при отключении
}
```

### Параметр reconnect

Если `reconnect: true`, бот будет автоматически переподключаться при отключении:

- **Бан**: переподключение через 400 секунд (400000мс)
- **Слишком много подключений**: переподключение через 20 секунд
- **Сервер полный**: переподключение через 40 секунд  
- **Другие причины**: случайное время от 10 до 20 секунд

## Основные методы BotManager

- `createAndConnectBot(address, name, params)` - создание и подключение бота
- `getBot(name)` - получение объекта бота с событиями
- `connectBot(name)` - подключение существующего бота
- `disconnectBot(name)` - отключение бота
- `reconnectBot(name)` - переподключение бота (удален)
- `disconnectAllBots()` - отключение всех ботов
- `isBotConnected(name)` - проверка статуса подключения
- `getBotClient(name)` - получение клиента бота
- `getAllActiveBots()` - список всех активных ботов

## Методы объекта бота

- `bot.connect()` - подключение
- `bot.disconnect()` - отключение
- `bot.reconnect()` - переподключение (удален)
- `bot.isConnected()` - проверка статуса
- `bot.client` - доступ к клиенту DDRaceBot
- `bot.movement` - API для управления движением
- `bot.chat` - API для чата и эмоций
- `bot.name` - имя бота
- `bot.info` - информация о боте

## API движения (BotMovement)

### Основные движения:
- `movement.runLeft()` - бег влево
- `movement.runRight()` - бег вправо
- `movement.stop()` - остановка
- `movement.jump(value)` - прыжок
- `movement.hook(value)` - крюк
- `movement.setAim(x, y)` - прицеливание
- `movement.fire()` - стрельба
- `movement.say(message)` - сообщение в чат
- `movement.kill()` - убийство

### Комплексные движения:
- `movement.moveLeft()` - движение влево с остановкой
- `movement.moveRight()` - движение вправо с остановкой
- `movement.jumpAndStop()` - прыжок с остановкой
- `movement.hookAndStop()` - крюк с остановкой

### Дополнительные методы:
- `movement.setChatting(flag)` - установка флага чата
- `movement.nextWeapon()` - следующее оружие
- `movement.prevWeapon()` - предыдущее оружие

### Состояние персонажа:
- `movement.getCharacterState()` - полная информация о персонаже
- `movement.isFrozen()` - проверка заморозки
- `movement.autoKillOnFreeze(timeout)` - автоКилл при заморозке

## API чата и эмоций (BotChatEmote)

### Базовый чат:
- `chat.say(message)` - отправка сообщения
- `chat.setChatEnabled(enabled)` - включение/выключение чата

### Базовые эмоции:
- `chat.emote(type)` - отправка эмоции
- `chat.startAutoEmote(type, interval)` - запуск автоматических эмоций
- `chat.stopAutoEmote()` - остановка автоматических эмоций
- `chat.setEmoteEnabled(enabled)` - включение/выключение эмоций

### Очистка:
- `chat.cleanup()` - очистка ресурсов

## Дополнительные функции

Расширения находятся в папке `src/bot/features/`:

```javascript
// Пример использования расширения
const ChatCooldown = require('./src/bot/features/chat/cooldown');
const chatWithCooldown = new ChatCooldown(bot.chat);
chatWithCooldown.sayWithCooldown('Hello!', 3000);
``` 