"use strict";
class DebugLogger {
    /**
     * Класс DebugLogger
     * @param {string} prefix - Префикс для сообщений отладки
     * @param {boolean} isDebug - Флаг для включения/выключения режима отладки
     * @param {boolean} islog - Флаг для использования console.log вместо console.debug
     */
    constructor(prefix, isDebug = false, islog = true) {
        /**
         * @var {boolean} isDebug - Флаг для включения/выключения режима отладки
         */
        this.isDebug = isDebug;
        /** 
         * @var {boolean} islog - Флаг для использования console.log вместо console.debug
         */
        this.islog = islog;
        /**
         * @var {string} prefix - Префикс для сообщений отладки
         */
        this.prefix = prefix;
    }
    /**
     * Функция для логирования отладочной информации
     * @param {...*} args - Аргументы для логирования
     */
    logDebug(...args) {
        const prefix = this.prefix; // Используем префикс из свойства класса
        if (this.isDebug) { // Проверяем, включен ли режим отладки
            if (this.islog) { // Проверяем, использовать ли console.log
                console.log(`[`+prefix+`]`, ...args); // Используем console.log с префиксом
            } else { // Иначе
                console.debug(`[`+prefix+`] `, ...args); // Используем console.debug с префиксом
            }
        }
    }

    /** * Функция для установки режима отладки и использования console.log
     * @param {boolean} debugMode - Включить или выключить режим отладки
     * @param {boolean} useLog - Использовать console.log вместо console.debug
     */
    setDebugMode(debugMode, useLog = true) { // лог по умолчанию, потому что мне так удобнее
        this.isDebug = debugMode; // Устанавливаем режим отладки
        this.islog = useLog; // Устанавливаем использование console.log
    }
}

module.exports = DebugLogger; // Экспортируем класс DebugLogger

// Пример использования класса DebugLogger
if (require.main === module) {
    const test = new DebugLogger('test', true, true); // Создаем экземпляр класса с префиксом 'test', режим отладки включен и используем console.log
    test.logDebug('cum.'); // Логируем сообщение
    test.setDebugMode(false); // Выключаем режим отладки
    test.logDebug('ето не выведется.'); // Это сообщение не будет выведено
    test.setDebugMode(true, false); // Включаем режим отладки и используем console.debug
    test.logDebug('ето выведется в console.debug.'); // Логируем сообщение
}