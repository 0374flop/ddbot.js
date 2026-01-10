const BaseModule = require('../core/module');

class Chat extends BaseModule {
    constructor(bot) {
        super(bot, 'Chat');
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
        };
    }

    _start(interval = 1000) {
        this.chatinterval = setInterval(() => {
            this.chatset.clear();
        }, interval);
        this.bot.on('message', this.chatlistener);
    }

    _stop() {
        this.bot.off('message', this.chatlistener);
        this.chatset.clear();
        if (this.chatinterval) {
            clearInterval(this.chatinterval);
            this.chatinterval = null;
        }
    }
}

module.exports = Chat;