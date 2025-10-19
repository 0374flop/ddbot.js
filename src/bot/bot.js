const DDRaceBot = require('neiky-ddracebot.js');
const EventEmitter = require('events');

class BotManager extends EventEmitter {
    constructor() {
        super();
        this.activeBots = new Map();
        this.botCounter = 0;
        this.botFreezeStates = new Map(); // Хранит состояние заморозки для каждого бота
        this.playerLists = new Map(); // Хранит список игроков по каждому боту
    }

    // Утилиты для работы с адресом сервера
    getIP(address) {
        const parts = address.split(':');
        return parts[0];
    }

    getPort(address) {
        const parts = address.split(':');
        return parseInt(parts[1], 10);
    }

    // Генерация уникального имени бота
    generateUniqueBotName(baseName) {
        this.botCounter++;
        return `${baseName}${this.botCounter}`;
    }

    // Создание и подключение бота
    async createAndConnectBot(fulladdress, botName, parameter = {}) {
        const serverIp = this.getIP(fulladdress);
        const serverPort = this.getPort(fulladdress);
        
        if (!serverIp || !serverPort) {
            return null;
        }

        const uniqueBotName = this.generateUniqueBotName(botName);
        try {
            const identity = parameter.identity || {
                clan: "",
                skin: "default",
                use_custom_color: 0,
                color_body: 0,
                color_feet: 0,
                country: 0
            };
            const client = new DDRaceBot.Client(serverIp, serverPort, botName, { 
                identity: identity
            });

            // Настраиваем события для бота
            this._setupBotEvents(uniqueBotName, client);

            // Сохраняем информацию о боте
            this.activeBots.set(uniqueBotName, {
                client,
                fulladdress,
                originalName: botName,
                parameter,
                isConnected: false,
                createdAt: Date.now()
            });

            // Инициализируем состояние заморозки
            this.botFreezeStates.set(uniqueBotName, false);

            // Подключаемся к серверу
            await this.connectBot(uniqueBotName);

            return uniqueBotName;
        } catch (error) {
            return null;
        }
    }

    // Подключение бота
    async connectBot(botName) {
        const botInfo = this.activeBots.get(botName);
        if (!botInfo) {
            return false;
        }

        try {
            botInfo.client.joinDDRaceServer();
            botInfo.client.on('connection_au_serveur_ddrace', () => {
                botInfo.isConnected = true;
            });
            return true;
        } catch (error) {
            return false;
        }
    }

    // Отключение бота
    async disconnectBot(botName) {
        const botInfo = this.activeBots.get(botName);
        if (!botInfo) {
            return false;
        }

        try {
            botInfo.client.Disconnect();
            botInfo.isConnected = false;
            this.removeBot(botName);
            return true;
        } catch (error) {
            return false;
        }
    }

    // Отключение всех ботов
    async disconnectAllBots() {
        const botNames = Array.from(this.activeBots.keys());
        const results = await Promise.allSettled(
            botNames.map(botName => this.disconnectBot(botName))
        );
        this.botFreezeStates.clear(); // Очищаем все состояния заморозки
        this.playerLists.clear(); // Очищаем списки игроков
        return results;
    }

    // Получение информации о боте
    getBotInfo(botName) {
        return this.activeBots.get(botName);
    }

    // Проверка подключения бота
    isBotConnected(botName) {
        const botInfo = this.activeBots.get(botName);
        return botInfo ? botInfo.isConnected : false;
    }

    // Проверка состояния заморозки бота
    isFreezeBot(botName) {
        return this.botFreezeStates.get(botName) || false;
    }

    // Установка состояния заморозки бота
    setFreezeBot(botName, isFrozen) {
        this.botFreezeStates.set(botName, isFrozen);
    }

    // Получение всех активных ботов
    getAllActiveBots() {
        return Array.from(this.activeBots.keys());
    }

    // Получение клиента бота
    getBotClient(botName) {
        const botInfo = this.activeBots.get(botName);
        return botInfo ? botInfo.client : null;
    }

    // Удаление бота из менеджера
    removeBot(botName) {
        const botInfo = this.activeBots.get(botName);
        if (botInfo) {
            // Отключаем если подключен
            if (botInfo.isConnected) {
                botInfo.client.disconnect();
            }
            this.activeBots.delete(botName);
            this.botFreezeStates.delete(botName);
            this.playerLists.delete(botName);
            return true;
        }
        return false;
    }

    // Получение объекта бота с событиями
    getBot(botName) {
        const botInfo = this.activeBots.get(botName);
        if (!botInfo) {
            return null;
        }

        // Создаем прокси-объект для бота с событиями
        const bot = {
            name: botName,
            client: botInfo.client,
            movement: botInfo.movement,
            chat: botInfo.chatEmote,
            info: botInfo,
            
            // Методы для работы с событиями
            on: (event, callback) => {
                this.on(`${botName}:${event}`, callback);
            },
            
            off: (event, callback) => {
                this.off(`${botName}:${event}`, callback);
            },
            
            once: (event, callback) => {
                this.once(`${botName}:${event}`, callback);
            },
            
            // Методы управления
            connect: () => this.connectBot(botName),
            disconnect: () => this.disconnectBot(botName),
            
            // Проверка статуса
            isConnected: () => this.isBotConnected(botName)
        };

        return bot;
    }

    // Настройка событий для конкретного бота
    _setupBotEvents(botName, client) {
        client.on('connection_au_serveur_ddrace', () => {
            this.emit(`${botName}:connect`);
            this.emit(`${botName}:connected`);
        });

        client.on('disconnect', (reason) => {
            const botInfo = this.activeBots.get(botName);
            if (!botInfo) return;

            if (botInfo.parameter.reconnect) {
                let reconnectTime = 10000;
                if (reason.startsWith('You have been banned')) {
                    if (reason.startsWith('You have been banned for 5 minutes (Banned by vote)')) {
                        reconnectTime = 300000;
                    } else {
                        reconnectTime = 1000000;
                    }
                } else if (reason.startsWith('Too many connections in a short time')) {
                    reconnectTime = 20000;
                } else if (reason.startsWith('Timed Out. (no packets received for ')) {
                    reconnectTime = 1000;
                }
                
                this.emit(`${botName}:disconnect`, reason, reconnectTime);
                this.emit(`${botName}:disconnected`, reason, reconnectTime);
                setTimeout(() => {
                    client.joinDDRaceServer();
                }, reconnectTime);
            }
        });

        client.on('snapshot', (snapshot) => {
            try {
                const myDDNetChar = client.SnapshotUnpacker.getObjExDDNetCharacter(client.SnapshotUnpacker.OwnID);
                if (myDDNetChar) {
                    const isFrozen = myDDNetChar.m_FreezeEnd !== 0;
                    this.botFreezeStates.set(botName, isFrozen);
                }
            } catch (error) {}

            const playerList = [];

            for (let client_id = 0; client_id < 64; client_id++) {
                const clientInfo = client.SnapshotUnpacker.getObjClientInfo(client_id);
                const playerInfo = client.SnapshotUnpacker.getObjPlayerInfo(client_id);
                const ddnetChar = client.SnapshotUnpacker.getObjExDDNetCharacter
                    ? client.SnapshotUnpacker.getObjExDDNetCharacter(client_id)
                    : null;
            
                if (clientInfo && clientInfo.name && playerInfo && playerInfo.m_Team !== -1) {
                    playerList.push({
                        client_id,
                        name: clientInfo.name, // имя
                        clan: clientInfo.clan || '', // клан
                        country: clientInfo.country || -1, // страна
                        team: playerInfo.m_Team, // тима
                        skin: clientInfo.skin || 'default', // имя скина игрока
                        x: ddnetChar ? ddnetChar.m_X : null, // координата X
                        y: ddnetChar ? ddnetChar.m_Y : null  // координата Y
                    });
                }
            }
            
            this.playerLists.set(botName, playerList);            

            this.emit(`${botName}:snapshot`, snapshot);
        });

        let s = new Set();
        const chatinterval = setInterval(() => s.clear(), 5000);
        client.on('message_au_serveur', (msg) => {
            this.emit(`${botName}:message`, msg);
            const key = `${msg.client_id}:${msg.message}:${msg.team}`;
            if (s.has(key)) return;
            s.add(key);
            this.emit(`${botName}:chat`, msg);
        });

        client.on('error', (error) => {
            this.emit(`${botName}:error`, error);
        });

        client.on('map_details', (mapDetails) => {
            this.emit(`${botName}:map_details`, mapDetails);
        });
    }
    getPlayerList(botName) {
        return this.playerLists.get(botName) || [];
    }
}

module.exports = BotManager;