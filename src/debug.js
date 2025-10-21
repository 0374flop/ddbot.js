"use strict";

let hasChalk = false;
let chalklib;
try {
    require.resolve('chalk');
    chalklib = require('chalk');
    hasChalk = true;
} catch {
    hasChalk = false;
}

class DebugLogger {
    /**
     * Класс DebugLogger.
     * @param {string} prefix - Префикс для сообщений отладки.
     * @param {boolean} isDebug - Флаг для включения/выключения режима отладки.
     * @param {boolean} islog - Флаг для использования console.log вместо console.debug.
     * @param {object} prefixforprefix - Префикс для префикса. Аррей, Array где 1 айтем для начала, и 2 для конца оригинальноо префикса.
     * @param {boolean} chalk - Изпользовать красивый цветной текст или нет.
     */
    constructor(prefix, isDebug = false, islog = true, prefixforprefix = ['[',']'], chalk = true) {
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
        /**
         * @var {object} prefixforprefix - Array Массив из двух строк, которые будут по бокам обычного префикса.
         */
        this.prefixforprefix = prefixforprefix;
        /**
         * @var {boolean} chalk - Изпользовать ли цветные тексты.
         */
        this.chalk = chalk;
    }
    /**
     * Функция для логирования отладочной информации
     * @param {...*} args - Аргументы для логирования
     */
    logDebug(...args) {
        const prefix = this.prefix; // Используем префикс из свойства класса
        const prefixforprefix = this.prefixforprefix; // префикс для префикса
        if (this.isDebug) { // Проверяем, включен ли режим отладки
            if (this.islog) { // Проверяем, использовать ли console.log
                if (this.chalk && hasChalk) { // Проверяем есть ли chalk
                    console.log(
                        chalklib.grey(prefixforprefix[0]),
                        chalklib.green(prefix),
                        chalklib.grey(prefixforprefix[1]),
                        chalklib.blue(...args)
                    );
                } else {
                    console.log(prefixforprefix[0], prefix, prefixforprefix[1], ...args);
                } // Используем console.log с префиксом
            } else { // Иначе
                if (this.chalk && hasChalk) {
                    console.debug(
                        chalklib.grey(prefixforprefix[0]),
                        chalklib.green(prefix),
                        chalklib.grey(prefixforprefix[1]),
                        chalklib.blue(...args)
                    ); 
                } else {
                    console.debug(prefixforprefix[0], prefix, prefixforprefix[1], ...args); // Используем console.debug с префиксом
                }
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

// Экспортируем класс DebugLogger
module.exports = DebugLogger;
module.exports.DebugLogger = DebugLogger; // ну чтобы можно было класно короче


// Пример использования класса DebugLogger
if (require.main === module) {
    let test = new DebugLogger('test', true, true, ["[","]"], true); // Создаем экземпляр класса с префиксом 'test', режим отладки включен и используем console.log
    function log() {
        test.logDebug('cum.'); // Логируем сообщение
        test.setDebugMode(false); // Выключаем режим отладки
        test.logDebug('ето не выведется.'); // Это сообщение не будет выведено
        test.setDebugMode(true, false); // Включаем режим отладки и используем console.debug
        test.logDebug('ето выведется в console.debug.'); // Логируем сообщение
    }
    log();
    test = new DebugLogger('говно', true, true, ['1','Какашечка'], false);
    log();
    test = new DebugLogger('говно', true, true, ['Абоба','2'], true);
    log();
}