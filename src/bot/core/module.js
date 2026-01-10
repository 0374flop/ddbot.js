const EventEmitter = require('events');

class BaseModule extends EventEmitter {
    constructor(bot, moduleName = 'Module') {
        super();
        if (!bot) throw new Error(`${moduleName} requires bot core`);
        this.bot = bot;
        this.moduleName = moduleName;
        this.isRunning = false;

        this._onDisconnect = () => this.destroy();
        this.bot.on('disconnect', this._onDisconnect);
    }

    /**
     * @param {...any} args - Параметры для _start()
     */
    start(...args) {
        if (this.isRunning) return;
        this.isRunning = true;
        this._start(...args);
    }

    stop() {
        if (!this.isRunning) return;
        this.isRunning = false;
        this._stop();
    }

    /**
     * Переопределяется в подклассе
     * @param {...any} args
     */
    _start(...args) {}

    /**
     * Переопределяется в подклассе
     */
    _stop() {}

    destroy() {
        this.stop();
        this.bot.off('disconnect', this._onDisconnect);
        this.removeAllListeners();
    }
}

module.exports = BaseModule;