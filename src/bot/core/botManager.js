const DDRaceBot = require('neiky-ddracebot.js');
const EventEmitter = require('events');
const BotMovement = require('./BotMovement');
const BotChatEmote = require('./BotChat-emote');

class BotManager extends EventEmitter {
    constructor() {
        super();
        this.activeBots = new Map();
        this.botCounter = 0;
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
            console.error('IP or port not specified');
            return null;
        }

        const uniqueBotName = this.generateUniqueBotName(botName);
        console.log(`Creating bot: ${uniqueBotName} on ${fulladdress}`);

        try {
            const client = new DDRaceBot.Client(serverIp, serverPort, uniqueBotName, { 
                identity: parameter.identity 
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

            // Подключаемся к серверу
            await this.connectBot(uniqueBotName);

            return uniqueBotName;
        } catch (error) {
            console.error(`Failed to create bot ${uniqueBotName}:`, error);
            return null;
        }
    }

    // Подключение бота
    async connectBot(botName) {
        const botInfo = this.activeBots.get(botName);
        if (!botInfo) {
            console.error(`Bot ${botName} not found`);
            return false;
        }

        try {
            botInfo.client.joinDDRaceServer();
            botInfo.client.on('connection_au_serveur_ddrace', () => {
                botInfo.isConnected = true;
                console.log(`Bot ${botName} connected successfully`);
            });
            return true;
        } catch (error) {
            console.error(`Failed to connect bot ${botName}:`, error);
            return false;
        }
    }

    // Отключение бота
    async disconnectBot(botName) {
        const botInfo = this.activeBots.get(botName);
        if (!botInfo) {
            console.error(`Bot ${botName} not found`);
            return false;
        }

        try {
            botInfo.client.Disconnect();
            botInfo.isConnected = false;
            console.log(`Bot ${botName} disconnected successfully`);
            this.removeBot(botName);
            return true;
        } catch (error) {
            console.error(`Failed to disconnect bot ${botName}:`, error);
            return false;
        }
    }

    // Отключение всех ботов
    async disconnectAllBots() {
        const botNames = Array.from(this.activeBots.keys());
        const results = await Promise.allSettled(
            botNames.map(botName => this.disconnectBot(botName))
        );
        
        console.log(`Disconnected ${botNames.length} bots`);
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
            console.log(`Bot ${botName} removed from manager`);
            return true;
        }
        return false;
    }

    // Получение объекта бота с событиями
    getBot(botName) {
        const botInfo = this.activeBots.get(botName);
        if (!botInfo) {
            console.error(`Bot ${botName} not found`);
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
        // Подключение к серверу
        client.on('connection_au_serveur_ddrace', () => {
            this.emit(`${botName}:connect`);
            this.emit(`${botName}:connected`);
        });

        // Отключение от сервера
        client.on('disconnect', (reason) => {            
            this.emit(`${botName}:disconnect`, reason);
            this.emit(`${botName}:disconnected`, reason);
            
            // Проверяем, нужно ли переподключаться
            const botInfo = this.activeBots.get(botName);
            if (botInfo) {
                console.log(`Bot ${botName} disconnected from server, reason: ${reason}`);
            } else {
                return;
            }
            if (botInfo && botInfo.parameter.reconnect) {
                if (reason.startsWith('You have been banned')) {
                    console.log(`Bot ${botName} was banned.`);
                    console.log(`Bot ${botName} will reconnect in 400000ms`);
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
                    console.log(`Bot ${botName} will reconnect in ${reconnectTime}ms`);
                    setTimeout(() => {
                        client.joinDDRaceServer();
                    }, reconnectTime);
                }
            }
        });

        // Получение снапшота
        client.on('snapshot', (snapshot) => {
            this.emit(`${botName}:snapshot`, snapshot);
        });

        // Получение сообщения
        client.on('message_au_serveur', (msg) => {
            this.emit(`${botName}:message`, msg);
            this.emit(`${botName}:chat`, msg);
        });

        // Дополнительные события
        client.on('error', (error) => {
            this.emit(`${botName}:error`, error);
        });
    }
}

module.exports = BotManager; 