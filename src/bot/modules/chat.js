const BaseModule = require('../core/module');

class Chat extends BaseModule {
    /**
     * @param {import('../core/core')} bot
     */
    constructor(bot) {
        super(bot, 'Chat');
        this.chatinterval = null;
        this.chatset = new Set();
        this.chatlistener = (msg) => {
            try {
                const msgraw = msg;
                const text = msg?.message;
                const client_id = msg?.client_id;
                const autormsg = (msg?.author?.ClientInfo?.name || null);
                const team = msg?.team;

                const key = `${client_id}:${text}:${team}`;
                if (this.chatset.has(key)) return;
                this.chatset.add(key);

                this.emit(`anychat`, msgraw, autormsg, text, team, client_id);
                if (autormsg) {
                    this.emit(`chat`, msgraw, autormsg, text, team, client_id);
                } else {
                    this.emit(`systemchat`, msgraw, text);
                }
            } catch (e) {
                console.error(e);
            }
        };

        this.queue = [];
        this.lastSentTime = 0;
        this.cooldown = 1000;
        this.sendinterval = null;

    }

    /**
     * 
     * @param {string} text 
     * @param {boolean|undefined} team 
     * @param {boolean|undefined} priority 
     * @returns {boolean}
     */
    send(text, team = false, priority = false) {
        if (!text || text.trim().length === 0) return false;

        const item = { text, team };

        if (priority) {
            this.queue.unshift(item);
        } else {
            this.queue.push(item);
        }

        this.emit('queued', { 
            text,
            team,
            queueSize: this.queue.length 
        });

        return true;
    }

    _processQueue() {
        if (this.queue.length === 0) return;

        const now = Date.now();
        if (now - this.lastSentTime < this.cooldown) return;

        const { text, team } = this.queue.shift();

        if (this.bot.bot_client) {
            this.bot.bot_client?.game?.Say(text, team);
            this.lastSentTime = now;

            this.emit('sent', {
                text,
                team,
                queueSize: this.queue.length
            });
        }
    }

    /**
     * Start the chat module
     * @param {number} interval - Interval for clearing chat cache in milliseconds
     * @param {number} cooldown - Minimum delay in milliseconds between outgoing chat messages
     */
    _start(interval = 1000, cooldown = 1000) {
        this.cooldown = cooldown;

        this.chatinterval = setInterval(() => {
            this.chatset.clear();
        }, interval);

        this.sendinterval = setInterval(() => {
            this._processQueue();
        }, 100);

        this.bot.on('message', this.chatlistener);
    }

    /**
     * Stop the chat module
     */
    _stop() {
        this.bot.off('message', this.chatlistener);
        this.chatset.clear();

        if (this.chatinterval) {
            clearInterval(this.chatinterval);
            this.chatinterval = null;
        }

        if (this.sendinterval) {
            clearInterval(this.sendinterval);
            this.sendinterval = null;
        }
    }
}

module.exports = Chat;