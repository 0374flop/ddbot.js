"use strict";

const OriginalTeeworlds = require('teeworlds');
const EventEmitter = require('events');
const DDUtils = require('./ddutils');

/**
 * @typedef {import('./ddutils.js').ConnectionInfo} ConnectionInfo
 * 
 * @typedef {import('./ddutils.js').Identity} Identity
 * 
 * @typedef {import('./ddutils.js').Input} Input
 */

class Bot extends EventEmitter {
    constructor(identity, options, CustomTeeworlds = OriginalTeeworlds) {
        super();
        this.teeworlds = CustomTeeworlds;
        this.client = new this.teeworlds.Client();

        this.options = options;
        this.identity = DDUtils.IsValidIdentity(identity) ? identity : DDUtils.DefaultIdentity('nameless tee');

        this.status = {
            connect: {
                connected: false,
                connecting: false
            },
            addr: null,
            port: null
        }

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
            this.client.SnapshotUnpacker.removeAllListeners();
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
        if (this.status.connect.connected || this.status.connect.connecting) {
            return Promise.reject(new Error('Already connected or connecting'));
        }
        this.status.connect.connecting = true;
        this.status.addr = addr;
        this.status.port = port;

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
                this.status.connect.connecting = false;
                resolve();
            };
            
            const onDisconnect = (reason) => {
                if (settled) return;
                settled = true;
                clearTimeout(timer);
                cleanup();
                this.status.connect.connecting = false;
                reject(new Error(`Disconnected during connect: ${reason}`));
            };
            
            const timer = setTimeout(() => {
                if (settled) return;
                settled = true;
                cleanup();
                this.status.connect.connecting = false;
                this.clean(true);
                reject(new Error('Connection timeout'));
            }, timeout);
            
            this.once('connect', onConnect);
            this.once('disconnect', onDisconnect);
            this.client.connect();
        });
    }

    async disconnect() {
        this.status.connect.connecting = false;
        if (this.client && this.status.connect.connected) {
            try {
                await this.client.Disconnect();
            } catch (e) {
                console.error(e);
            }
            this.status.connect.connected = false;
            this.emit('disconnect', null, { addr: this.status.addr, port: this.status.port });
        }
        this.clean(true);
    }

    /**
     * @param {Identity} identity 
     */
    change_identity(identity) {
        this.identity = typeof identity === 'object' ? identity : DDUtils.DefaultIdentity(this.identity.name);
        if (this.client && this.status.connect.connected) this.client.game.ChangePlayerInfo(this.identity);
    }

    /**
     * @param {Input} input 
     */
    send_input(input) {
        if (!this.client) return;
        // if (!DDUtils.IsValidInput(input)) return;
        this.client.movement.input = { ...input }
    }

    client_events() {
        this.clean(false)
        this.client.on('connected', () => {
            this.status.connect.connected = true;
            /**
             * @event Bot#connect
             * @type {ConnectionInfo}
             */
            this.emit('connect', { addr: this.status.addr, port: this.status.port });
        });

        this.client.on('disconnect', (reason = null) => {
            this.status.connect.connected = false;
            this.clean(true);
            if (!reason) return;
            /**
             * @event Bot#disconnect
             * @param {string} reason
             * @param {ConnectionInfo} info
             */
            this.emit('disconnect', reason, { addr: this.status.addr, port: this.status.port });
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

        this.client.SnapshotUnpacker.on('spawn', (message) => {
            this.emit('spawn', message);
        });

        this.client.SnapshotUnpacker.on('death', (message) => {
            this.emit('death', message);
        });

        this.client.SnapshotUnpacker.on('hammerhit', (message) => {
            this.emit('hammerhit', message);
        });

        this.client.SnapshotUnpacker.on('sound_world', (message) => {
            this.emit('sound_world', message);
        });

        this.client.SnapshotUnpacker.on('explosion', (message) => {
            this.emit('explosion', message);
        });

        this.client.SnapshotUnpacker.on('common', (message) => {
            this.emit('common', message);
        });

        this.client.SnapshotUnpacker.on('damage_indicator', (message) => {
            this.emit('damage_indicator', message);
        });

        this.client.SnapshotUnpacker.on('sound_global', (message) => {
            this.emit('sound_global', message);
        });
    }

    /**
     * @type {number}
     */
    get OwnID() {
        if (!(this.client && this.status.connect.connected)) return;
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

    async destroy() {
        await this.disconnect();
        this.removeAllListeners();
        this._clientProxy = null;
    }
}

module.exports = Bot;