"use strict";

import { Client } from 'teeworlds';
import * as Teeworlds from 'teeworlds';
import { EventEmitter } from 'events';
import * as DDUtils from './ddutils.js';
import * as Types from '../types.js';

interface BotEvents {
	connect: (info: Types.ConnectionInfo) => void;
	disconnect: (reason: string | null, info: Types.ConnectionInfo) => void;
	broadcast: (message: string) => void;
	capabilities: (message: {
		ChatTimeoutCode: boolean;
		AnyPlayerFlag: boolean;
		PingEx: boolean;
		AllowDummy: boolean;
		SyncWeaponInput: boolean;
	}) => void;
	emote: (message: Types.SnapshotItemTypes.iEmoticon) => void;
	kill: (kill: Types.SnapshotItemTypes.iKillMsg) => void;
	snapshot: (items: Types.DeltaItem[]) => void;
	map_change: (message: Types.SnapshotItemTypes.iMapChange) => void;
	motd: (message: string) => void;
	message: (message: Types.SnapshotItemTypes.iMessage) => void;
	teams: (teams: Array<number>) => void;
	teamkill: (teamkill: Types.SnapshotItemTypes.iKillMsgTeam) => void;
	// Snapshot
	spawn: (msg: Types.SnapshotItemTypes.Spawn) => void;
	death: (msg: Types.SnapshotItemTypes.Death) => void;
	hammerhit: (msg: Types.SnapshotItemTypes.HammerHit) => void;
	sound_world: (msg: Types.SnapshotItemTypes.SoundWorld) => void;
	explosion: (msg: Types.SnapshotItemTypes.Explosion) => void;
	common: (msg: Types.SnapshotItemTypes.Common) => void;
	damage_indicator: (msg: Types.SnapshotItemTypes.DamageInd) => void;
	sound_global: (msg: Types.SnapshotItemTypes.SoundGlobal) => void;
}

interface BotStatus {
	connect: {
		connected: boolean;
		connecting: boolean;
	};
	addr: string | null;
	port: number | null;
}

export class Bot extends EventEmitter {
	private teeworlds: typeof import('teeworlds');
	private client: Client | null = null;
	private _clientProxy: Client | null = null;

	public options: Types.SnapshotItemTypes.iOptions;
	public identity: Types.SnapshotItemTypes.Identity;

	public status: BotStatus = {
		connect: {
			connected: false,
			connecting: false,
		},
		addr: null,
		port: null,
	};

	/**
	 * 
	 * @param identity Bot identity
	 * @param options Options for teeworlds.Client
	 * @param CustomTeeworlds Custom teeworlds
	 */
	constructor(
		identity?: Types.SnapshotItemTypes.Identity,
		options: Types.SnapshotItemTypes.iOptions = {},
		CustomTeeworlds: typeof import('teeworlds') = Teeworlds
	) {
		super();

		this.teeworlds = CustomTeeworlds;
		this.options = options;

		this.identity = DDUtils.IsValidIdentity(identity)
			? identity
			: DDUtils.DefaultIdentity('nameless tee');
	}

	/**
	 * Get bot identity
	 */
	public get bot_identity(): Types.SnapshotItemTypes.Identity {
		return this.identity;
	}

	/**
	 * Create new Teeworlds client instance
	 */
	private create_client(addr: string, port: number): void {
		this.disconnect();
		this.clean(true);

		this.client = new this.teeworlds.Client(addr, port, this.identity.name, {
			...this.options,
			identity: this.identity,
		});

		this.client.movement.FlagScoreboard(true);
		this.client_events();
	}

	/**
	 * Clean up client event listeners
	 */
	private clean(clear = false): void {
		try {
			if (!this.client) return;

			this.client.removeAllListeners();
			this.client.SnapshotUnpacker?.removeAllListeners();

			if (clear) {
				this.client = null;
			}
		} catch (e) {
			console.error('Error during clean:', e);
		}
	}

	/**
	 * Connect to a DDNet server
	 * @param addr - Server address
	 * @param port - Server port (default: 8303)
	 * @param timeout - Connection timeout in ms (default: 5000)
	 * @returns Promise with connection info
	 */
	public async connect(addr: string, port = 8303, timeout = 5000): Promise<Types.ConnectionInfo> {
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
		await this.create_client(addr, port);

		return new Promise((resolve, reject) => {
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
				resolve({ addr: this.status.addr!, port: this.status.port! });
			};

			const onDisconnect = (reason: string | null) => {
				if (settled) return;
				settled = true;
				clearTimeout(timer);
				cleanup();
				this.status.connect.connecting = false;
				reject(new Error(`Disconnected during connect: ${reason ?? 'unknown reason'}`));
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

			this.client!.connect();
		});
	}

	/**
	 * Disconnect from server
	 * @returns Promise with disconnection info or null
	 */
	public async disconnect(): Promise<Types.ConnectionInfo | null> {
		this.status.connect.connecting = false;
		let info: Types.ConnectionInfo | null = null;

		if (this.client && this.status.connect.connected) {
			try {
				await this.client.Disconnect();
			} catch (e) {
				console.error('Error during disconnect:', e);
			}

			this.status.connect.connected = false;
			info = { addr: this.status.addr!, port: this.status.port! };
			this.emit('disconnect', null, info);
		}

		this.clean(true);
		return info;
	}

	/**
	 * Change bot identity (name, skin, colors, etc.)
	 * @param identity - New identity or partial identity update
	 */
	public change_identity(identity: Types.SnapshotItemTypes.Identity | Partial<Types.SnapshotItemTypes.Identity>): void {
		this.identity =
			typeof identity === 'object' && identity !== null
				? { ...this.identity, ...identity }
				: DDUtils.DefaultIdentity(this.identity.name);

		if (this.client && this.status.connect.connected) {
			this.client.game.ChangePlayerInfo(this.identity);
		}
	}

	/**
	 * Send input to the game (movement, aim, actions)
	 * @param input - Partial input object
	 */
	public send_input(input: Partial<Types.SnapshotItemTypes.PlayerInput>): void {
		if (!this.client) return;
		this.client.movement.input = { ...this.client.movement.input, ...input };
	}

	/**
	 * Setup all client event listeners and forward them
	 */
	private client_events(): void {
		this.clean(false);

		if (!this.client) return;

		// Connection events
		this.client.on('connected', () => {
			this.status.connect.connected = true;
			this.emit('connect', { addr: this.status.addr!, port: this.status.port! });
			this.setup_snapshot_events();
		});

		this.client.on('disconnect', (reason: string | null = null) => {
			this.status.connect.connected = false;
			this.clean(true);
			if (!!reason) {
				this.emit('disconnect', reason, { addr: this.status.addr!, port: this.status.port! });
			}
		});

		// Game events
		this.client.on('broadcast', (msg) => this.emit('broadcast', msg));
		this.client.on('capabilities', (msg) => this.emit('capabilities', msg));
		this.client.on('emote', (msg) => this.emit('emote', msg));
		this.client.on('kill', (msg) => this.emit('kill', msg));
		this.client.on('snapshot', (msg) => this.emit('snapshot', msg));
		this.client.on('map_change', (msg) => this.emit('map_change', msg));
		this.client.on('motd', (msg) => this.emit('motd', msg));
		this.client.on('message', (msg) => this.emit('message', msg));
		this.client.on('teams', (msg) => this.emit('teams', msg));
		this.client.on('teamkill', (msg) => this.emit('teamkill', msg));
	}

	/*
	 * Setup snapshot unpacker events
	 */
	private setup_snapshot_events(): void {
		if (!this.client?.SnapshotUnpacker) {
			console.warn('SnapshotUnpacker not available yet');
			return;
		}

		this.client.SnapshotUnpacker.removeAllListeners();

		this.client.SnapshotUnpacker.on('spawn', (msg) => this.emit('spawn', msg));
		this.client.SnapshotUnpacker.on('death', (msg) => this.emit('death', msg));
		this.client.SnapshotUnpacker.on('hammerhit', (msg) => this.emit('hammerhit', msg));
		this.client.SnapshotUnpacker.on('sound_world', (msg) => this.emit('sound_world', msg));
		this.client.SnapshotUnpacker.on('explosion', (msg) => this.emit('explosion', msg));
		this.client.SnapshotUnpacker.on('common', (msg) => this.emit('common', msg));
		this.client.SnapshotUnpacker.on('damage_indicator', (msg) => this.emit('damage_indicator', msg));
		this.client.SnapshotUnpacker.on('sound_global', (msg) => this.emit('sound_global', msg));
	}

	/**
	 * Get bot's own client ID
	 */
	public get OwnID(): number | undefined {
		if (!this.client || !this.status.connect.connected) return undefined;
		return this.client.SnapshotUnpacker?.OwnID;
	}

	/**
	 * Get proxied client instance for safe access
	 */
	public get bot_client(): Client | null {
		if (!this.client) return null;

		if (!this._clientProxy) {
			const self = this;
			this._clientProxy = new Proxy({} as Client, {
				get(target, prop: keyof Client) {
					if (!self.client) return undefined;
					const value = self.client[prop];
					return typeof value === 'function' ? value.bind(self.client) : value;
				},
				set(target, prop: keyof Client, value) {
					if (!self.client) return false;
					(self.client as any)[prop] = value;
					return true;
				},
			});
		}

		return this._clientProxy;
	}

	/**
	 * Destroy bot instance and clean up all resources
	 */
	public async destroy(): Promise<void> {
		await this.disconnect();
		this.removeAllListeners();
		this._clientProxy = null;
	}

	public on<K extends keyof BotEvents>(event: K, listener: BotEvents[K]): this;
	public on(event: string | symbol, listener: (...args: any[]) => void): this {
		return super.on(event, listener);
	}

	public once<K extends keyof BotEvents>(event: K, listener: BotEvents[K]): this;
	public once(event: string | symbol, listener: (...args: any[]) => void): this {
		return super.once(event, listener);
	}

	public emit<K extends keyof BotEvents>(event: K, ...args: Parameters<BotEvents[K]>): boolean;
	public emit(event: string | symbol, ...args: any[]): boolean {
		return super.emit(event, ...args);
	}

	public off<K extends keyof BotEvents>(event: K, listener: BotEvents[K]): this;
	public off(event: string | symbol, listener: (...args: any[]) => void): this {
		return super.off(event, listener);
	}
}

export default Bot;