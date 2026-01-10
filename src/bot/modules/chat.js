"use strict";

const EventEmitter = require('events');

class Chat extends EventEmitter {
    /**
     * @param {import('../core/core')} bot
     */
    constructor(bot) {
        super();
        if (!bot) throw new Error('Chat requires bot core');
        this.bot = bot;

        this.chatinterval = null;
        this.chatset = new Set();
        this.chatlistener = (msg) => {
            const msgraw = msg;
            const text = msg.message;
            const client_id = msg.client_id;
            const autormsg = (msg.author?.ClientInfo?.name || null);
            const team = msg.team;

            const key = `${client_id}:${text}:${team}`;
            if (this.chatset.has(key)) return;
            this.chatset.add(key);

            this.emit(`anychat`, msgraw, autormsg, text, team, client_id);
            if (autormsg) {
                this.emit(`chat`, msgraw, autormsg, text, team, client_id);
            } else {
                this.emit(`systemchat`, msgraw, text);
            }
        }

        this._onDisconnect = () => this.destroy();
        this.bot.on('disconnect', this._onDisconnect);
    }

    /**
     * clear chatlistener, Interval, chatset
    */
    clear() {
        this.bot.off('message', this.chatlistener);
        this.chatset.clear();
        if (this.chatinterval) {
            clearInterval(this.chatinterval);
            this.chatinterval = null;
        }
    }

    /**
     * start
     * @param {number} time - Interval clear chatset (ms)
     */
    start(time = 1000) {
        this.clear();
        this.chatinterval = setInterval(() => {
            this.chatset.clear();
        }, time);
        this.bot.on('message', this.chatlistener);
    }

    /**
     * stop
     */
    stop() {
        this.clear();
    }

    /**
     * Cleanup
     */
    destroy() {
        this.stop();
        this.bot.off('disconnect', this._onDisconnect);
        this.removeAllListeners();
    }
}

module.exports = Chat;