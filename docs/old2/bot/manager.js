const Bot = require('./core/core');
const EventEmitter = require('events');

class BotManager extends EventEmitter {
    constructor() {
        super();
        this.bots = new Map();
        this.names = new Set();
    }

    botevents(id, bot) {
            bot.on('connect', (data) => {
                this.emit(id + ':connect', data);
            });

            bot.on('disconnect', (reason, data) => {
                this.emit(id + ':disconnect', reason, data);
            });

            bot.on('broadcast', (message) => {
                this.emit(id + ':broadcast', message);
            });

            bot.on('capabilities', (message) => {
                this.emit(id + ':capabilities', message);
            });

            bot.on('emote', (message) => {
                this.emit(id + ':emote', message);
            });

            bot.on('kill', (message) => {
                this.emit(id + ':kill', message);
            });

            bot.on('snapshot', (message) => {
                this.emit(id + ':snapshot', message);
            });

            bot.on('map_change', (message) => {
                this.emit(id + ':map_change', message);
            });

            bot.on('motd', (message) => {
                this.emit(id + ':motd', message);
            });

            bot.on('message', (message) => {
                this.emit(id + ':message', message);
            });

            bot.on('teams', (message) => {
                this.emit(id + ':teams', message);
            });

            bot.on('teamkill', (message) => {
                this.emit(id + ':teamkill', message);
            });

            bot.on('spawn', (message) => {
                this.emit(id + ':spawn', message);
            });

            bot.on('death', (message) => {
                this.emit(id + ':death', message);
            });

            bot.on('hammerhit', (message) => {
                this.emit(id + ':hammerhit', message);
            });

            bot.on('sound_world', (message) => {
                this.emit(id + ':sound_world', message);
            });

            bot.on('explosion', (message) => {
                this.emit(id + ':explosion', message);
            });

            bot.on('common', (message) => {
                this.emit(id + ':common', message);
            });

            bot.on('damage_indicator', (message) => {
                this.emit(id + ':damage_indicator', message);
            });

            bot.on('sound_global', (message) => {
                this.emit(id + ':sound_global', message);
            });
    }

    createUniqueName() {
        const baseName = 'bot_';
        let counter = this.names.size + 1;
        
        while (this.names.has(baseName + counter)) {
            counter++;
        }
        
        const uniqueName = baseName + counter;
        this.names.add(uniqueName);
        return uniqueName;
    }

    createBot(config) {
        const bot = new Bot(...config);
        const id = this.createUniqueName();
        this.botevents(id, bot);
        this.bots.set(id, bot);
        return id;
    }

    removeBotById(id) {
        const bot = this.bots.get(id);
        if (bot) {
            bot.destroy();
            this.bots.delete(id);
        }
    }

    addBot(bot) {
        const id = this.createUniqueName();
        this.bots.set(id, bot);
        return id;
    }

    /**
     * @param {string} id
     * @returns {import('./core/core')}
     */
    getBotById(id) {
        return this.bots.get(id);
    }

    async disconnectAllBots() {
        for (const bot of this.bots.values()) {
            try {
                await bot?.disconnect();
            } catch (e) {
                console.error(e);
            }
        }
    }

    async removeAllBots() {
        for (const bot of this.bots.values()) {
            try {
                await bot?.destroy();
            } catch (e) {
                console.error(e);
            }
            this.bots.delete(bot.botId);
        }
    }

    sendinputToAllBots(input) {
        for (const bot of this.bots.values()) {
            try {
                bot?.send_input(input);
            } catch (e) {
                console.error(e);
            }
        }
    }
}

module.exports = BotManager;