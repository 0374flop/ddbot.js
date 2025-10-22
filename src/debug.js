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
        if (typeof isDebug === "boolean") this.isDebug = isDebug; else this.isDebug = false;
        /** 
         * @var {boolean} islog - Флаг для использования console.log вместо console.debug
         */
        if (typeof islog === "boolean") this.islog = islog; else this.islog = true;
        /**
         * @var {string} prefix - Префикс для сообщений отладки
         */
        if (typeof prefix === "string") this.prefix = prefix; else this.prefix = "null";
        /**
         * @var {object} prefixforprefix - Array Массив из двух строк, которые будут по бокам обычного префикса.
         */
        if (Array.isArray(prefixforprefix)) this.prefixforprefix = prefixforprefix; else this.prefixforprefix = ['[',']'];    
        /**
         * @var {boolean} chalk - Изпользовать ли цветные тексты.
         */
        if (typeof chalk === "boolean") this.chalk = chalk; else this.chalk = hasChalk;
    }

    /**
     * Формат, ПфП1, префикс, ПфП2, Аргументы.
     * @param {string} prefix - Префикс
     * @param {object} prefixforprefix - ПфП, то что по бокам префикса.
     * @param  {...any} args - Данные.
     * @returns {string} Цветовой текст в формате.
     */
    _format(prefix, prefixforprefix, ...args) {
        if (this.chalk && hasChalk)
            return [chalklib.grey(prefixforprefix[0]), chalklib.green(prefix), chalklib.grey(prefixforprefix[1]), chalklib.blue(...args)];
        return [prefixforprefix[0], prefix, prefixforprefix[1], ...args];
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
                console.log(...this._format(prefix, prefixforprefix, ...args));
            } else { // Иначе
                console.debug(...this._format(prefix, prefixforprefix, ...args));
            }
        }
    }

    /** 
     * Функция для установки режима отладки и использования console.log
     * @param {boolean} debugMode - Включить или выключить режим отладки
     * @param {boolean} useLog - Использовать console.log вместо console.debug
     * @param {boolean} chalk - Изпользовать ли цветной текст или нет
     */
    setDebugMode(debugMode, useLog = true, chalk = this.chalk) { // лог по умолчанию, потому что мне так удобнее
        this.chalk = chalk
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
    test = new DebugLogger('кал', true, true, ['Абоба','2'], true);
    log();
}