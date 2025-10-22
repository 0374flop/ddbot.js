"use strict";
const { bot } = require('../bot');
const mapLoader = require('./maploader');
const DebugLogger = require('../debug');
const logDebuger = new DebugLogger('Automaploader', false, true);
const logdebug = logDebuger.logDebug;

const EventEmitter = require('events');
const eventEmitter = new EventEmitter();



const registeredHandlers = new Set(); // чтобы не срать обработчиками


/** * Функция для работы с Automaploader
 * @param {string} botName - Имя бота, для которого будет работать Automaploader
 * @param {string} dir - Папка, в которую будут загружаться карты
 * @returns {Promise<void>} Пустой промис после регистрации обработчика
 */
async function work(botName, dir) {
    // Проверяем, не зарегистрирован ли уже обработчик для этого бота
    const handlerKey = `${botName}:map_details`;
    if (registeredHandlers.has(handlerKey)) {
        return; // Обработчик уже зарегистрирован
    }
    
    registeredHandlers.add(handlerKey); // Добавляем обработчик в множество

    // Регистрация обработчика события map_details для данного бота
    bot.on(`${botName}:map_details`, (mapDetails) => {
        const mapName = mapDetails.map_name; // Извлекаем имя карты из объекта mapDetails
        logdebug(`Automaploader`, `Received map details for bot "${botName}":`, mapDetails);
        // Вызываем загрузку карты с помощью mapLoader
        mapLoader.loadMap(mapName, dir)
            .then((loaded) => {
                eventEmitter.emit(`automaploader:map_loaded`, { loaded, mapDetails, botName, dir});
                logdebug(`Automaploader`, `Map "${mapName}" loaded: ${loaded}, for bot "${botName}"`);
            });
    });
}

/**
 * Automaploader — объект для автоматической загрузки карт
 */
const Automaploader = {
    /**
     * Запускает автомаплоадер для бота
     * @param {string} botName - Имя бота
     * @param {string} dir - Папка для загрузки карт
     */
    work,

    /**
     * Подписка на события Automaploader
     * @param {string} event - Имя события (Пока что только одно, "automaploader:map_loaded")
     * @param {function(Object): void} callback - Колбэк для события с объектом { loaded, mapDetails, botName, dir }
     */
    on: eventEmitter.on.bind(eventEmitter)
};

module.exports = { Automaploader, logDebuger };