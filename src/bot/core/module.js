const EventEmitter = require('events');

class BaseModule extends EventEmitter {
    /**
     * @param {import('./core')} bot
     * @param {string} moduleName - Module name
     */
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
     * Start the module
     * @param {...any} args - Parameters for _start()
     */
    start(...args) {
        if (this.isRunning) return;
        this.isRunning = true;
        this._start(...args);
    }

    /**
     * Stop the module
     */
    stop() {
        if (!this.isRunning) return;
        this.isRunning = false;
        this._stop();
    }

    /**
     * Override in subclass
     * @param {...any} args
     */
    _start(...args) {}

    /**
     * Override in subclass
     */
    _stop() {}

    /**
     * Cleanup and remove all listeners
     */
    destroy() {
        this.stop();
        this.bot.off('disconnect', this._onDisconnect);
        this.removeAllListeners();
    }
}

module.exports = BaseModule;