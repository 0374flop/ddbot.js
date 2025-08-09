const DDRaceBot = require('neiky-ddracebot.js');
const EventEmitter = require('events');
const BotMovement = require('./BotMovement');
const BotChatEmote = require('./BotChat-emote');
const logger = require('../../logger').getLogger('BotManager');

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
            logger.error('IP or port not specified');
            return null;
        }

        const uniqueBotName = this.generateUniqueBotName(botName);
        logger.info(`Creating bot: ${uniqueBotName} on ${fulladdress}`);

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

            // Увеличиваем лимит слушателей
            if (client.socket) {
                client.socket.setMaxListeners(20);
            }

            // Настраиваем события для бота
            this._setupBotEvents(uniqueBotName, client);

            // Создаем объекты для управления движением и чатом
            const movement = new BotMovement(client);
            const chatEmote = new BotChatEmote(client);

            // Сохраняем информацию о боте
            this.activeBots.set(uniqueBotName, {
                client,
                movement,
                chatEmote,
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
            logger.error(`Failed to create bot ${uniqueBotName}:`, error);
            return null;
        }
    }

    // Подключение бота
    async connectBot(botName) {
        const botInfo = this.activeBots.get(botName);
        if (!botInfo) {
            logger.error(`Bot ${botName} not found`);
            return false;
        }

        try {
            botInfo.client.joinDDRaceServer();
            botInfo.client.on('connection_au_serveur_ddrace', () => {
                botInfo.isConnected = true;
                logger.info(`Bot ${botName} connected successfully`);
            });
            return true;
        } catch (error) {
            logger.error(`Failed to connect bot ${botName}:`, error);
            return false;
        }
    }

    // Отключение бота
    async disconnectBot(botName) {
        const botInfo = this.activeBots.get(botName);
        if (!botInfo) {
            logger.error(`Bot ${botName} not found`);
            return false;
        }

        try {
            botInfo.client.Disconnect();
            botInfo.isConnected = false;
            logger.info(`Bot ${botName} disconnected successfully`);
            this.removeBot(botName);
            return true;
        } catch (error) {
            logger.error(`Failed to disconnect bot ${botName}:`, error);
            return false;
        }
    }

    // Отключение всех ботов
    async disconnectAllBots() {
        const botNames = Array.from(this.activeBots.keys());
        const results = await Promise.allSettled(
            botNames.map(botName => this.disconnectBot(botName))
        );
        
        logger.info(`Disconnected ${botNames.length} bots`);
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
            logger.error(`Bot ${botName} not found`);
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
            this.emit(`${botName}:disconnect`, reason);
            this.emit(`${botName}:disconnected`, reason);
            
            const botInfo = this.activeBots.get(botName);
            if (!botInfo) return;

            logger.info(`Bot ${botName} disconnected from server, reason: ${reason}`);

            if (botInfo.parameter.reconnect) {
                if (reason.startsWith('You have been banned')) {
                    logger.info(`Bot ${botName} was banned.`);
                    logger.info(`Bot ${botName} will reconnect in 400000ms`);
                    setTimeout(() => {
                        client.joinDDRaceServer();
                    }, 400000);
                } else {
                    let reconnectTime = 6000;
                    if (reason.startsWith('Too many connections in a short time')) {
                        reconnectTime = 20000;
                    } else if (reason.startsWith('This server is full')) {
                        reconnectTime = 40000;
                    }
                    logger.info(`Bot ${botName} will reconnect in ${reconnectTime}ms`);
                    setTimeout(() => {
                        client.joinDDRaceServer();
                    }, reconnectTime);
                }
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
                logger.error(`Error updating freeze state for ${botName}:`, error);
            }

            const playerList = [];

            for (let client_id = 0; client_id < 64; client_id++) {
                const clientInfo = client.SnapshotUnpacker.getObjClientInfo(client_id);
                const playerInfo = client.SnapshotUnpacker.getObjPlayerInfo(client_id);
                if (clientInfo && clientInfo.name && playerInfo && playerInfo.m_Team !== -1) {
                    playerList.push({
                        client_id,
                        name: clientInfo.name,
                        clan: clientInfo.clan || '',
                        country: clientInfo.country || -1,
                        team: playerInfo.m_Team,
                        score: playerInfo.m_Score || 0,
                    });
                }
            }

            playerList.sort((a, b) => {
                if (a.team !== b.team) return a.team - b.team;
                return b.score - a.score;
            });

            this.playerLists.set(botName, playerList);

            this.emit(`${botName}:snapshot`, snapshot);
        });

        client.on('message_au_serveur', (msg) => {
            this.emit(`${botName}:message`, msg);
            this.emit(`${botName}:chat`, msg);
        });

        client.on('error', (error) => {
            this.emit(`${botName}:error`, error);
        });

        client.on('map_details', (mapDetails) => {
            this.emit(`${botName}:map_details`, mapDetails);
        });
    }

    // Новый метод для получения списка игроков по имени бота
    getPlayerList(botName) {
        return this.playerLists.get(botName) || [];
    }
}

module.exports = BotManager;