const DDRaceBot = require('neiky-ddracebot.js');
const EventEmitter = require('events');

let isDebug = false;
let islog = true;
function logDebug(...args) {
    const prefix = '[BotManager] ';
    if (isDebug) {
        if (islog) {
            console.log(prefix, ...args);
        } else {
            console.debug(prefix, ...args);
        }
    }
}

function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

class BotManager extends EventEmitter {
    constructor() {
        super();
        this.activeBots = new Map();
        this.botCounter = 0;
        this.botFreezeStates = new Map(); // Хранит состояние заморозки для каждого бота
        this.playerLists = new Map(); // Хранит список игроков по каждому боту
    }

    setDebugMode(status) {
        isDebug = status;
        return isDebug;
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
        logDebug('generateUniqueBotName called with baseName:', baseName);
        this.botCounter++;
        const name = `${baseName}${this.botCounter}`;
        logDebug('Generated unique bot name:', name);
        return name;
    }

    // Создание и подключение бота
    async createAndConnectBot(fulladdress, botName, parameter = {}) {
        logDebug('createAndConnectBot called with:', fulladdress, botName, parameter);
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
            logDebug('creating bot client');
            const client = new DDRaceBot.Client(serverIp, serverPort, botName, { 
                identity: identity
            });

            // Настраиваем события для бота
            this._setupBotEvents(uniqueBotName, client);

            // Сохраняем информацию о боте
            logDebug('storing bot info');
            this.activeBots.set(uniqueBotName, {
                client,
                fulladdress,
                originalName: botName,
                parameter,
                isConnected: false,
                createdAt: Date.now()
            });

            // Инициализируем состояние заморозки
            logDebug('initializing freeze state');
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
        logDebug('connectBot called with botName:', botName);
        const botInfo = this.activeBots.get(botName);
        if (!botInfo) {
            return false;
        }
        try {
            botInfo.client.joinDDRaceServer();
            return true;
        } catch (error) {
            return false;
        }
    }

    // Отключение бота
    async disconnectBot(botName) {
        logDebug('disconnectBot called with botName:', botName);
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
        logDebug('disconnectAllBots called');
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
        logDebug('removeBot called with botName:', botName);
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
        logDebug('_setupBotEvents called for botName:', botName);
        let chatinterval = null;

        client.on('connection_au_serveur_ddrace', () => {
            const botInfo = this.activeBots.get(botName);
            if (!botInfo) { 
                return;
            } else {
                botInfo.isConnected = true;
            }
            this.emit(`${botName}:connect`);
            this.emit(`${botName}:connected`);
            logDebug(`${botName} connected to server`);
        });

        client.on('disconnect', (reason) => {
            let botInfo = this.activeBots.get(botName);
            if (!botInfo) { 
                return;
            } else {
                botInfo.isConnected = false;
                clearInterval(chatinterval);
            }

            if (botInfo.parameter.reconnect && reason && (botInfo.parameter.reconnectAttempts>0 || botInfo.parameter.reconnectAttempts===-1)) {
                if (botInfo.parameter.reconnectAttempts!==-1)botInfo.parameter.reconnectAttempts--;

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
                    reconnectTime = 500;
                }

                if (botInfo.parameter.randreconnect) {
                    const randomtime = random(reconnectTime, reconnectTime+random(100, 1000));
                    reconnectTime = randomtime;
                    logDebug('Randomized reconnect time to:', reconnectTime);
                }

                this.emit(`${botName}:disconnect`, reason, reconnectTime);
                this.emit(`${botName}:disconnected`, reason, reconnectTime);
                logDebug(`${botName} disconnected due to:`, reason, '\nand reconnecting in', reconnectTime, 'ms');
                setTimeout(() => {
                    client.joinDDRaceServer();
                    this.emit(`${botName}:reconnect`, reconnectTime);
                    logDebug(`${botName} reconnect now`);
                }, reconnectTime);
            } else {
                this.emit(`${botName}:disconnect`, reason);
                this.emit(`${botName}:disconnected`, reason);
                logDebug(`${botName} disconnected due to:`, reason);
            }
        });

        client.on('snapshot', (snapshot) => {
            try {
                const myDDNetChar = client.SnapshotUnpacker.getObjExDDNetCharacter(client.SnapshotUnpacker.OwnID);
            if (myDDNetChar) {
                const isFrozen = myDDNetChar.m_FreezeEnd !== 0;
                this.botFreezeStates.set(botName, isFrozen);
            }
            } catch (error) {
                logDebug('Error processing snapshot for botName:', botName, error);
            }

            try {
                const oldList = this.playerLists.get(botName) || [];
                const playerMap = new Map(oldList.map(p => [p.client_id, p]));

                for (let client_id = 0; client_id < 64; client_id++) {
                    const clientInfo = client.SnapshotUnpacker.getObjClientInfo(client_id);
                    const playerInfo = client.SnapshotUnpacker.getObjPlayerInfo(client_id);
                    const ddnetChar = client.SnapshotUnpacker.getObjExDDNetCharacter
                        ? client.SnapshotUnpacker.getObjExDDNetCharacter(client_id)
                        : null;

                    if (clientInfo && clientInfo.name && playerInfo && playerInfo.m_Team !== -1) {
                        playerMap.set(client_id, {
                            client_id,
                            name: clientInfo.name,
                            clan: clientInfo.clan || '',
                            country: clientInfo.country || -1,
                            team: playerInfo.m_Team,
                            skin: clientInfo.skin || 'default',
                            x: ddnetChar ? ddnetChar.m_X : null,
                            y: ddnetChar ? ddnetChar.m_Y : null
                        });
                    }
                }
            } catch (error) {
                logDebug('Error updating player list for botName:', botName, error);
            }

            this.playerLists.set(botName, Array.from(playerMap.values()));

            this.emit(`${botName}:snapshot`, snapshot);
        });

        let s = new Set(); // сет
        chatinterval = setInterval(() => {
            s.clear();
        }, 1000); // чистка
        client.on('message_au_serveur', (msg) => {
            this.emit(`${botName}:message`, msg); // Сырое сообщение, без фильтрации

            const msgraw = msg; // ориг для чата на всякий
            const text = msg.message; // само сообщение
            const client_id = msg.client_id; // айди отправителя
            const autormsg = msg.client_id === -1 ? "system" : this.getPlayerName(botName, client_id) || msg.utilisateur.InformationDuBot.name; // имя отправителя
            const team = msg.team; // команда отправителя

            // фильтрация дубликатов сообщений
            const key = `${client_id}:${text}:${team}`;
            if (s.has(key)) return;
            s.add(key);

            // емитим.
            if (client_id !== -1) this.emit(`${botName}:ChatNoSystem`, msgraw, autormsg, text, team, client_id); // все только без системы или сервера
            this.emit(`${botName}:ChatRaw`, msgraw, autormsg, text, team, client_id); // все сообщения
        });

        client.on('error', (error) => {
            logDebug('error event for botName:', botName, error);
            this.emit(`${botName}:error`, error);
        });

        client.on('map_details', (mapDetails) => {
            logDebug('map_details event for botName:', botName, mapDetails);
            this.emit(`${botName}:map_details`, mapDetails);
        });
    }
    getPlayerList(botName) {
        return this.playerLists.get(botName) || [];
    }
    getPlayerName(botName, clientId) {
        const playerList = this.getPlayerList(botName);
        const player = playerList.find(p => p.client_id === clientId);
        return player ? player.name : null;
    }
}

module.exports = BotManager;