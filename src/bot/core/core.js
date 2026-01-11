"use strict";

const OriginalTeeworlds = require('teeworlds');
const EventEmitter = require('events');
const DDUtils = require('./ddutils');

class Bot extends EventEmitter {
    constructor(identity, options, CustomTeeworlds = OriginalTeeworlds) {
        super();
        this.teeworlds = CustomTeeworlds;
        this.client = new this.teeworlds.Client();

        this.options = options;
        this.identity = DDUtils.IsValidIdentity(identity) ? identity : DDUtils.DefaultIdentity('nameless tee');

        this.status = {
            connected: false,
            connecting: false
        }
        this.lastAddr = null;
        this.lastPort = null;

        this._clientProxy = null;

        this.clean(true)
    }

    get bot_identity() {
        return this.identity;
    }

    create_client(addr, port) {
        this.disconnect();
        this.clean(true);
        this.client = new this.teeworlds.Client(addr, port, this.identity.name, {
            ...(this.options || {}),
            identity: this.identity
        });
        this.client.movement.FlagScoreboard(true);
        this.client_events();
    }

    clean(clear = false) {
        try {
            if (!this.client) return;
            this.client.removeAllListeners();
            if (clear) {
                this.client = null;
            }
        } catch (e) {
            console.error(e);
        } // единственная ошибка которую он может словить, ето только тогда когда !this.client во время this.client.removeAllListeners(), хотя мы всеравно проверяем.
    }

    connect(addr, port = 8303, timeout = 5000) {
        if (typeof addr !== 'string' || typeof port !== 'number') {
            return Promise.reject(new Error('Invalid address or port'));
        }
        if (timeout <= 0) {
            return Promise.reject(new Error('Timeout must be positive'));
        }
        if (this.status.connected || this.status.connecting) {
            return Promise.reject(new Error('Already connected or connecting'));
        }
        this.status.connecting = true;
        this.lastAddr = addr;
        this.lastPort = port;

        return new Promise((resolve, reject) => {
            this.create_client(addr, port);
            
            let settled = false;
            
            const cleanup = () => {
                this.off('connect', onConnect);
                this.off('disconnect', onDisconnect);
            };
            
            const onConnect = () => {
                if (settled) return;
                settled = true;
                clearTimeout(timer);
                cleanup();
                this.status.connecting = false;
                resolve();
            };
            
            const onDisconnect = (reason) => {
                if (settled) return;
                settled = true;
                clearTimeout(timer);
                cleanup();
                this.status.connecting = false;
                reject(new Error(`Disconnected during connect: ${reason}`));
            };
            
            const timer = setTimeout(() => {
                if (settled) return;
                settled = true;
                cleanup();
                this.status.connecting = false;
                this.clean(true);
                reject(new Error('Connection timeout'));
            }, timeout);
            
            this.once('connect', onConnect);
            this.once('disconnect', onDisconnect);
            this.client.connect();
        });
    }

    async disconnect() {
        this.status.connecting = false;
        if (this.client && this.status.connected) {
            try {
                await this.client.Disconnect()
            } catch (e) {
                console.error(e);
            }
            this.status.connected = false;
            this.emit('disconnect', null, { addr: this.lastAddr, port: this.lastPort });
        }
        this.clean(true);
    }

    change_identity(identity) {
        this.identity = DDUtils.IsValidIdentity(identity) ? identity : DDUtils.DefaultIdentity(this.identity.name);
        if (this.client && this.status.connected) this.client.game.ChangePlayerInfo(this.identity);
    }

    send_input(input) {
        if (!this.client) return;
        if (!DDUtils.IsValidInput(input)) return;
        this.client.movement.input = { ...input }
    }

    client_events() {
        this.clean(false)
        this.client.on('connected', () => {
            this.status.connected = true;
            this.emit('connect', { addr: this.lastAddr, port: this.lastPort });
        });

        this.client.on('disconnect', (reason) => {
            this.status.connected = false;
            this.clean(true);
            this.emit('disconnect', reason, { addr: this.lastAddr, port: this.lastPort });
        });

        this.client.on('broadcast', (message) => {
            this.emit('broadcast', message);
        });

        this.client.on('capabilities', (message) => {
            this.emit('capabilities', message);
        });

        this.client.on('emote', (message) => {
            this.emit('emote', message);
        });

        this.client.on('kill', (message) => {
            this.emit('kill', message);
        });

        this.client.on('snapshot', (message) => {
            this.emit('snapshot', message);
        });

        this.client.on('map_change', (message) => {
            this.emit('map_change', message);
        });

        this.client.on('motd', (message) => {
            this.emit('motd', message);
        });

        this.client.on('message', (message) => {
            this.emit('message', message);
        });

        this.client.on('teams', (message) => {
            this.emit('teams', message);
        });

        this.client.on('teamkill', (message) => {
            this.emit('teamkill', message);
        });
    }

    get OwnID() {
        if (!(this.client && this.status.connected)) return;
        return this.client.SnapshotUnpacker.OwnID;
    }
    /**
     * @type {import('teeworlds').Client}
     */
    get bot_client() {
        if (!this._clientProxy) {
            const self = this;
            this._clientProxy = new Proxy({}, {
                get(target, prop) {
                    if (!self.client) {
                        return undefined;
                    }
                    const value = self.client[prop];
                    if (typeof value === 'function') {
                        return value.bind(self.client);
                    }
                    return value;
                },
                set(target, prop, value) {
                    if (!self.client) {
                        return false;
                    }
                    self.client[prop] = value;
                    return true;
                }
            });
        }
        
        return this._clientProxy;
    }
    destroy() {
        this.disconnect();
        this.removeAllListeners();
        this._clientProxy = null;
    }
}

module.exports = Bot;