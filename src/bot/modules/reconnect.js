const BaseModule = require('../core/module');

class Reconnect extends BaseModule {
    /**
     * @param {import('../core/core')} bot
     */
    constructor(bot) {
        super(bot, 'Reconnect');
        this.maxAttempts = -1;
        this.randomDelay = true;
        this.currentAttempts = 0;
        this.reconnecting = false;
    }

    _start(maxAttempts = -1, randomDelay = true) {
        this.maxAttempts = maxAttempts;
        this.randomDelay = randomDelay;
        this.bot.on('disconnect', this.handleDisconnect);
    }

    /**
     * 
     * @param {string|null} reason 
     * @param {import('../core/ddutils').connectionInfo} connectionInfo { addr: 'string', port: num }
     */
    handleDisconnect = (reason, connectionInfo) => {
        if (!reason) return;
        if (this.reconnecting) return;
        
        if (!connectionInfo.addr || !connectionInfo.port) {
            this.emit('reconnect_failed', 'No connection info');
            return;
        }
        
        if (this.maxAttempts !== -1 && this.currentAttempts >= this.maxAttempts) {
            this.emit('reconnect_failed', this.currentAttempts);
            return;
        }

        const delay = this.calculateDelay(reason);
        this.reconnecting = true;
        this.currentAttempts++;

        this.emit('reconnecting', { 
            attempt: this.currentAttempts, 
            delay, 
            reason,
            addr: this.bot.lastAddr,
            port: this.bot.lastPort
        });

        setTimeout(async () => {
            try {
                await this.bot.connect(this.bot.lastAddr, this.bot.lastPort);
                this.currentAttempts = 0;
                this.emit('reconnected');
            } catch (err) {
                this.emit('reconnect_failed', err);
            } finally {
                this.reconnecting = false;
            }
        }, delay);
    }

    calculateDelay(reason) {
        let baseDelay = 10000;
        
        if (reason.startsWith('You have been banned for 5 minutes')) {
            baseDelay = 300000;
        } else if (reason.startsWith('You have been banned')) {
            baseDelay = 1000000;
        } else if (reason.startsWith('Too many connections')) {
            baseDelay = 20000;
        } else if (reason.startsWith('Timed Out')) {
            baseDelay = 500;
        }

        if (this.randomDelay) {
            return baseDelay + Math.random() * 1000;
        }
        return baseDelay;
    }

    _stop() {
        this.bot.off('disconnect', this.handleDisconnect);
        this.reconnecting = false;
        this.currentAttempts = 0;
    }
}

module.exports = Reconnect;