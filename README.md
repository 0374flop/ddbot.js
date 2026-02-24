# ddbot.js

Библиотека которая оборачивает teeworlds(npm i teeworlds) в более удобный (Для меня лично как минимум.) формат.

0374flop MIT

---
## начало
установка
```
npm i ddbot.js-0374
```

експорт
```ts
import * as ddbot from 'ddbot.js-0374';
```
```js
const ddbot = require('ddbot.js-0374');
```

простейший пример
```ts
    import * as ddbot from '../lib/index.js';

    const bot = new ddbot.Bot(/* identity, options, custom teeworlds */);
    // if no identity is provided, it will be default 'nameless tee' with default skin

    bot.on('connect', () => {
        console.log('Connected to server!');
    });

    bot.on('disconnect', () => {
        console.log('Disconnected from server!');
    });

    (async () => {
        await bot.connect('45.141.57.22', 8303, 20000); // IP, port, timeout (IP is of ddnet server)
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
```

## Документация

### Bot

```ts
const bot = new ddbot.Bot(identity?, options?, customTeeworlds?);
```

#### методы

**bot.connect(addr, port?, timeout?)** - подключится к серверу. возвращает `Promise<ConnectionInfo>`.

**bot.disconnect()** - отключится от сервера. возвращает `Promise<ConnectionInfo | null>`.

**bot.send_input(input)** - отправить инпут (движение, прицел, и тд).

**bot.change_identity(identity)** - сменить скин/имя/клан и тд.

**bot.destroy()** - полностью уничтожить бота, очищает все listeners.

#### геттеры

**bot.bot_client** - оригинальный клиент teeworlds. может быть `null` если не подключен. (Proxie)

**bot.bot_identity** - текущий identity бота.

**bot.OwnID** - clientId бота на сервере. `undefined` если не подключен.

#### события

**connect** - подключился. `(info: ConnectionInfo)`

**disconnect** - отключился. `(reason: string | null, info: ConnectionInfo)`

**error** - когда у бота ошибка `(...args: any[])`, (Почти не изпользуеться)

...остальные события проксируються из [teeworlds](https://github.com/swarfeya/teeworlds-library-ts/)

---
### Модули

Модули это отдельные куски функционала которые можно подключить к боту.
```ts
const chat = new ddbot.StandardModules.Chat(bot); // bot уже должен быть инициализирован! (не обязательно подключен)
chat.start();
```

---

#### Chat

> Слушает message, и дедублирует сообщения.
(из-за udp, они дублируються чтобы оно дошло, ведь там нет гарантии доставки.)

```ts
const chat = new ddbot.StandardModules.Chat(bot);
chat.start(interval?, cooldown?);
```

`interval` - как часто чиститься кеш дубликатов (ms, default: 1000)
`cooldown` - минимальная задержка между исходящими сообщениями (ms, default: 1000)

**chat.send(text, team?, priority?)** - добавить сообщение в очередь на отправку.

события:

**anychat** - любое сообщение `(msg, author, text, team, client_id)`

**chat** - сообщение от игрока `(msg, author, text, team, client_id)`

**systemchat** - системное сообщение `(msg, text)`

**queued** - сообщение добавлено в очередь `({ text, team, queueSize })`

**sent** - сообщение отправлено `({ text, team, queueSize })`

---

#### PlayerList

> Просто сканирует всех игроков от client_id = 0, до 64.
(Зделано чтобы быстро получить весь список игроков и для отслеживания заходов/выходов игроков.)

```ts
const playerlist = new ddbot.StandardModules.PlayerList(bot);
playerlist.start(maxclients?);
```
```ts
interface PlayerData {
	client_id: number;
	clientInfo: Types.SnapshotItemTypes.ClientInfo;
	playerInfo: Types.SnapshotItemTypes.PlayerInfo;
	character: Types.SnapshotItemTypes.Character | null;
	DDNetCharacter: Types.SnapshotItemTypes.DDNetCharacter | null;
}
```

`maxclients` - максимальное количество игроков (default: 64)

**playerlist.list** - список всех игроков `[client_id, PlayerData][]`

**playerlist.getPlayer(client_id)** - получить игрока по id. `PlayerData | null`

**playerlist.getPlayerCount()** - количество игроков онлайн

события:

**player_joined** - игрок зашел `({ client_id, name, playerData })`

**player_left** - игрок вышел `({ client_id, name, playerData })`

---

#### Reconnect

> Автоматически переподключает бота при дисконнекте. Умно считает задержку в зависимости от причины. (причины добыты експерементально с оф севреров)
```ts
const reconnect = new ddbot.StandardModules.Reconnect(bot);
reconnect.start(maxAttempts?, randomDelay?);
```

`maxAttempts` - максимальное количество попыток реконнекта (-1 для бесконечного, default: -1)
`randomDelay` - добавлять рандомную задержку к базовой (default: true)

события:

**reconnecting** - начинает переподключаться `({ attempt, delay, reason, ConnectionInfo })`

**reconnected** - успешно переподключился `({ addr, port })`

**reconnect_failed** - не смог переподключиться `(reason)`

---

#### Snap

> Слушает snapshot события и даёт удобные события поверх них. (зделаны не все)
```ts
const snap = new ddbot.StandardModules.Snap(bot);
snap.start();
```

**snap.isFrozen** - заморожен ли бот прямо сейчас

**Snap.angleshot(character)** - статичный метод, возвращает вектор прицела персонажа `{ x, y } | null`

события:

**hammerhitme** - кто-то ударил молотком по боту (или просто рядом, и пощитало не правильно) `(hit, client_id)`

**fire** - кто-то выстрелил рядом `(sound, client_id)`

**frozen** - бот заморозился

**unfrozen** - бот разморозился

---

### BaseModule

> Базовый класс для своих модулей.
```ts
import { BaseModule } from 'ddbot.js-0374';

class MyModule extends BaseModule {
    constructor(bot) {
        super(bot, { moduleName: 'MyModule' });
    }

    _start() {
        this.bot.on('connect', () => {
            console.log('connected!');
        });
    }

    _stop() {
        // cleanup
    }
}

const myModule = new MyModule(bot);
myModule.start();
```

`moduleName` - имя модуля (для ошибок)
`offonDisconnect` - автоматически вызывать `destroy()` при дисконнекте (default: true)

**module.start(...args)** - запустить модуль, вызывает `_start(...args)`

**module.stop()** - остановить модуль, вызывает `_stop()`

**module.destroy()** - полностью уничтожить модуль, очищает все listeners

**module.isRunning** - запущен ли модуль

---

### DDUtils

**DDUtils.DefaultIdentity(name?)** - возвращает дефолтный identity `Identity`, если имени нет, то 'nameless tee'

**DDUtils.connectionInfo()** - возвращает дефолтный `ConnectionInfo`,
'ConnectionInfo = {
    addr: 'string', port: 8303
}'

**DDUtils.reconstructPlayerInput(char, ddnetChar?, tick?)** - реконструирует инпут игрока из snapshot. NOT FULL. `Types.SnapshotItemTypes.PlayerInput`