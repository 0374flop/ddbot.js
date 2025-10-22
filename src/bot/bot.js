"use strict";
const DDRaceBot = require('neiky-ddracebot.js');
const EventEmitter = require('events');
const DebugLogger = require('../debug');
const DebugLogger2 = new DebugLogger('BotManager', false, true, null, true);
const logDebug = ( ...args) => {
    DebugLogger2.logDebug(...args);
}

function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

class BotManager extends EventEmitter {
    /**
     * Конструктор класса BotManager
     */
    constructor() {
        super();
        this.activeBots = new Map();
        this.botCounter = 0;
        this.botFreezeStates = new Map(); // Хранит состояние заморозки для каждого бота
        this.playerLists = new Map(); // Хранит список игроков по каждому боту
    }

    /**
     * Получение объекта DebugLogger для BotManager
     * @returns {DebugLogger} - Объект DebugLogger
     */
    getDebugLogger() {
        return DebugLogger2;
    }

    /**
     * Извлечение IP и порта из полного адреса
     * @param {string} address - Полный адрес в формате "IP:порт"
     * @returns {object} IP адрес и порт { address: string, port: number }
     */
    getIPsplitPort(address) {
        const parts = address.split(':');
        const ip = parts[0];            // IPv4 остаётся строкой
        const port = parseInt(parts[1], 10); // порт парсим в число
        return { address: ip, port: port };
    }

    /**
     * Генерация уникального имени бота
     * @param {string} baseName - Базовое имя бота
     * @returns {string} - Уникальное имя бота
     */
    generateUniqueBotName(baseName) {
        logDebug('generateUniqueBotName called with baseName:', baseName);
        this.botCounter++;
        const name = `${baseName}${this.botCounter}`;
        logDebug('Generated unique bot name:', name);
        return name;
    }

    /**
     * Создание и подключение бота к серверу
     * @param {string} fulladdress - Полный адрес сервера (IP:порт)
     * @param {string} botName - Имя бота
     * @param {Object} parameter - Параметры бота
     * @returns {Promise<string|null>} - Уникальное имя бота или null в случае ошибки
     */
    async createAndConnectBot(fulladdress, botName, parameter = {}) {
        logDebug('createAndConnectBot called with:', fulladdress, botName, parameter); // логируем вызов функции
        const { address, port } = this.getIPsplitPort(fulladdress); // разбираем адрес
        const serverIp = address; // айпи
        const serverPort = port; // порт
        
        if (!serverIp || !serverPort) {
            return new Error('и где мы возьмём айпи или порт? ты можешь нормально ввести адрес?');
        }

        const uniqueBotName = this.generateUniqueBotName(botName);
        try {
            const identity = parameter.identity || { // если нет индентити, создаём дефолтное
                clan: "",
                skin: "default",
                use_custom_color: 0,
                color_body: 0,
                color_feet: 0,
                country: 0
            };
            logDebug('creating bot client');
            // то самое место откуда создаеться клинт бота
            const client = new DDRaceBot.Client(serverIp, serverPort, botName, { 
                identity: identity // то самое индентити для скина и тд
            });

            // Настраиваем события для бота или пиздеи будет
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
            return null; // пиздеи
        }
    }

    /**
     * Подключение бота к серверу
     * @param {string} botName
     * @returns
     */
    async connectBot(botName) {
        logDebug('connectBot called with botName:', botName); // логируем вызов функции
        const botInfo = this.activeBots.get(botName); // получаем инфу о боте
        if (!botInfo) {
            return false; // бот не найден
        }
        try {
            botInfo.client.joinDDRaceServer(); // то самое место подключения
            return true; // да
        } catch (error) { // фак
            return false; // нет
        }
    }

    /**
     * Отключение бота от сервера
     * @param {string} botName 
     * @returns 
     */
    async disconnectBot(botName) {
        logDebug('disconnectBot called with botName:', botName); // логируем вызов функции
        const botInfo = this.activeBots.get(botName); // получаем инфу о боте
        if (!botInfo) {
            return false; // бот не найден
        }

        try {
            botInfo.client.Disconnect(); // отключаемся
            botInfo.isConnected = false; // обновляем статус
            logDebug('disconnectedBot', botName)
            return true; // да
        } catch (error) { // фак
            logDebug(error)
            return false; // нет
        }
    }

    /** 
     * Отключение всех ботов
     * @return {Promise<Array>} - Результаты отключения каждого бота
     */
    async disconnectAllBots() { 
        logDebug('disconnectAllBots called'); // логируем вызов функции
        const botNames = Array.from(this.activeBots.keys()); // получаем имена всех ботов
        const results = await Promise.allSettled( // Проходимся по каждому и даем по жопе и отключаем
            botNames.map(botName => this.disconnectBot(botName)) // отключаем каждого бота
        );
        this.botFreezeStates.clear(); // Очищаем все состояния заморозки
        this.playerLists.clear(); // Очищаем списки игроков
        return results; // возвращаем результаты
    }

    /**
     * Получение информации о боте
     * @param {string} botName 
     * @returns {Object|null} - Информация о боте или null, если бот не найден
     */
    getBotInfo(botName) {
        return this.activeBots.get(botName);
    }

    /**
     * Проверка подключения бота
     * @param {string} botName 
     * @returns {boolean} - true если бот подключен, иначе false
     */
    isBotConnected(botName) {
        const botInfo = this.activeBots.get(botName); // получаем инфу о боте
        return botInfo ? botInfo.isConnected : false; // подключен? да или нет
    }

    /**
     * Проверка состояния заморозки бота
     * @param {string} botName 
     * @returns {boolean} - true если бот заморожен, иначе false
     */
    isFreezeBot(botName) {
        return this.botFreezeStates.get(botName) || false; // возвращаем состояние заморозки
    }

    /**
     * Установка состояния заморозки бота (для внутреннего использования)
     * @param {string} botName - Имя бота
     * @param {boolean} isFrozen - true для заморозки, false для разморозки
     */
    setFreezeBot(botName, isFrozen) {
        this.botFreezeStates.set(botName, isFrozen);
    }

    /**
     * Получение всех активных ботов
     * @returns {object[]} - Массив имен всех активных ботов
     */
    getAllActiveBots() {
        return Array.from(this.activeBots.keys()); // возвращаем имена всех активных ботов
    }

    /**
     * Получение клиента бота по имени
     * @param {string} botName - Имя бота
     * @returns {object|null} - Объект клиента бота или null, если бот не найден
     */
    getBotClient(botName) {
        const botInfo = this.activeBots.get(botName); // получаем инфу о боте
        return botInfo ? botInfo.client : null; // возвращаем клиент или null
    }

    /** 
     * Удаление бота из менеджера
     * @param {string} botName - Имя бота
     * @returns {boolean} - true если бот был удален, иначе false
     */
    removeBot(botName) {
        logDebug('removeBot called with botName:', botName); // логируем вызов функции
        const botInfo = this.activeBots.get(botName); // получаем инфу о боте
        if (botInfo) {
            // Отключаем если подключен
            if (botInfo.isConnected) {
                botInfo.client.disconnect(); // отключаемся
            }
            this.activeBots.delete(botName); // удаляем бота
            this.botFreezeStates.delete(botName); // удаляем состояние заморозки
            this.playerLists.delete(botName); // удаляем список игроков
            return true;
        }
        return false;
    }

    /**
     * Получение объекта бота с событиями
     * @param {string} botName - Имя бота
     * @returns {object|null} - Объект бота с событиями или null, если бот не найден
     */
    getBot(botName) {
        const botInfo = this.activeBots.get(botName); // получаем инфу о боте
        if (!botInfo) {
            return null; // бот не найден
        }

        // Создаем прокси-объект для бота с событиями
        const bot = {
            name: botName, // скажи мое имя.
            client: botInfo.client, // сам клиент бота
            info: botInfo, // инфа о боте
            
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

        return bot; // ботик <3
    }

    /**     
     * Настройка событий бота (для внутреннего использования)
     * @param {string} botName - Имя бота
     * @param {object} client - Объект клиента бота
     */
    _setupBotEvents(botName, client) {
        logDebug('_setupBotEvents called for botName:', botName); // логируем вызов функции
        let chatinterval = null; // интервал для чата

        client.on('connection_au_serveur_ddrace', () => { // Шок контент бот зашел на сервер
            const botInfo = this.activeBots.get(botName); // получаем инфу о боте
            if (!botInfo) { 
                return; // бот не найден фак
            } else {
                botInfo.isConnected = true; // обновляем статус
            }
            this.emit(`${botName}:connect`); // емитим событие коннекта1
            this.emit(`${botName}:connected`); // емитим событие коннекта2
            logDebug(`${botName} connected to server`); // логируем подключение
        });

        client.on('disconnect', (reason) => { // бот отключился от сервера
            let botInfo = this.activeBots.get(botName); // получаем инфу о боте
            if (!botInfo) { 
                return; // бот не найден фак
            } else {
                botInfo.isConnected = false; // обновляем статус
                clearInterval(chatinterval); // очищаем интервал чата
            }

            if (botInfo.parameter.reconnect && (botInfo.parameter.reconnectAttempts>0 || botInfo.parameter.reconnectAttempts===-1)) {
                if (botInfo.parameter.reconnectAttempts!==-1)botInfo.parameter.reconnectAttempts--;

                let reconnectTime = 10000;
                logDebug('base reconnect time is '+reconnectTime+'ms');
                logDebug('Calculating reconnect time for botName: ', botName);
                if (reason.startsWith('You have been banned')) { // бота забанили, фааааааак
                    if (reason.startsWith('You have been banned for 5 minutes (Banned by vote)')) { // похуй, это всего лишь 5 минут и воутом а не админ
                        reconnectTime = 300000; // 5 минут
                    } else {
                        reconnectTime = 1000000; // ФАК админ забанил, надеемся что не долго
                    }
                } else if (reason.startsWith('Too many connections in a short time')) { // ладненько
                    reconnectTime = 20000; // 20 секунд
                } else if (reason.startsWith('Timed Out. (no packets received for ')) { // таймаут, если инет есть, просто нужно еще пару раз поконектиться и пройдет
                    reconnectTime = 500; // 0.5 секунд
                }

                logDebug('Base reconnect time set to:', reconnectTime);
                if (botInfo.parameter.randreconnect) { // рандомайзер времени риконнекта
                    const randomtime = random(reconnectTime, reconnectTime+random(100, 1000)); // рандом от базового времени до базового + 1 секунда
                    reconnectTime = randomtime; // устанавливаем рандомное время
                    logDebug('Randomized reconnect time to: ', reconnectTime); // логируем рандомное время
                }

                this.emit(`${botName}:disconnect`, reason, reconnectTime);
                this.emit(`${botName}:disconnected`, reason, reconnectTime);
                logDebug(`${botName} disconnected due to: `, reason, '\nand reconnecting in ', reconnectTime, 'ms');
                setTimeout(() => {
                    client.joinDDRaceServer();
                    this.emit(`${botName}:reconnect`, reconnectTime);
                    logDebug(`${botName} reconnect now`);
                }, reconnectTime);
            } else {
                this.emit(`${botName}:disconnect`, reason);
                this.emit(`${botName}:disconnected`, reason);
                logDebug(`${botName} disconnected due to: `, reason);
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
                this.playerLists.set(botName, Array.from(playerMap.values()));
            } catch (error) {
                logDebug('Error updating player list for botName:', botName, error);
            }

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
            const autormsg = msg.client_id === -1 ? "system" : this.getPlayerName(botName, client_id) || (msg.utilisateur?.InformationDuBot?.name || null) // имя отправителя
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
    /**
     * Получение списка игроков подключенных к тому же серверу что и бот
     * @param {string} botName 
     * @returns {Array} - Массив объектов игроков
     */
    getPlayerList(botName) {
        return this.playerLists.get(botName) || [];
    }

    /**
     * Получение имени игрока по его clientId
     * @param {string|Array} botName - Имя бота. Или, если конечно нужно, массив игроков.
     * @param {number} clientId - ID клиента игрока
     * @returns {string|null} - Имя игрока или null если не найден
     */
    getPlayerName(botName, clientId) {
        if (clientId === -1) return null;
        if (botName === null || botName === undefined) return null;
        if (Array.isArray(botName)) {
            const name = botName.find(bot => bot.client_id === clientId)?.name || null;
            return name;
        } else {
            const playerList = this.getPlayerList(botName);
            const player = playerList.find(p => p.client_id === clientId);
            return player ? player.name : null;
        }
    }
}

module.exports = BotManager; // экспортируем BotManager