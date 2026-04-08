import BaseModule from '../core/module.js';
import type { Bot } from '../core/core.js';
import type { Client } from 'teeworlds';
import type { Types } from '../index.js';

interface PlayerData {
	client_id: number;
	clientInfo: Types.SnapshotItemTypes.ClientInfo;
	playerInfo: Types.SnapshotItemTypes.PlayerInfo;
	character: Types.SnapshotItemTypes.Character | null;
	DDNetCharacter: Types.SnapshotItemTypes.DDNetCharacter | null;
}

interface PlayerJoinedInfo {
	client_id: number;
	name: string;
	playerData: PlayerData;
}

interface PlayerLeftInfo {
	client_id: number;
	name: string;
	playerData: PlayerData;
}

interface PlayerListEvents {
	/** Игрок появился в снапшоте (зашёл на сервер) */
	player_joined: (info: PlayerJoinedInfo) => void;
	/** Игрок пропал из снапшота (вышел с сервера) */
	player_left: (info: PlayerLeftInfo) => void;
}

class PlayerList extends BaseModule<[maxclients?: number]> {
	constructor(bot: Bot) {
		super(bot, { moduleName: 'PlayerList', offonDisconnect: false });
		this.client = this.bot.bot_client; // тута короче же прокси, так что ето работает
	}
	private client: Client | null;
	private maxclients: number = 64;
	private playermap: Map<number, PlayerData> = new Map();
	private previousMap: Map<number, PlayerData> = new Map();
	private isFirstSnapshot: boolean = true;

	private readonly snapshotlistener = (): void => {
		this.previousMap = new Map(this.playermap);
		this.playermap.clear();
		if (!this.client) return;

		for (let client_id = 0; client_id < this.maxclients; client_id++) {
			const clientInfo: Types.SnapshotItemTypes.ClientInfo = this.client.SnapshotUnpacker.getObjClientInfo(client_id);
			const playerInfo: Types.SnapshotItemTypes.PlayerInfo = this.client.SnapshotUnpacker.getObjPlayerInfo(client_id);
			const character: Types.SnapshotItemTypes.Character = this.client.SnapshotUnpacker.getObjCharacter(client_id);
			const DDNetCharacter: Types.SnapshotItemTypes.DDNetCharacter = this.client.SnapshotUnpacker.getObjExDDNetCharacter(client_id);

			if (clientInfo && playerInfo) {
				const playerData: PlayerData = {
					client_id,
					clientInfo,
					playerInfo,
					character: character || null,
					DDNetCharacter: DDNetCharacter || null,
				};
				this.playermap.set(client_id, playerData);

				if (!this.isFirstSnapshot && !this.previousMap.has(client_id)) {
					this.emit('player_joined', { client_id, name: clientInfo.name, playerData });
				}
			}
		}

		if (!this.isFirstSnapshot) {
			for (const [client_id, oldData] of this.previousMap) {
				if (!this.playermap.has(client_id)) {
					this.emit('player_left', {
						client_id,
						name: oldData.clientInfo.name,
						playerData: oldData,
					});
				}
			}
		}

		this.isFirstSnapshot = false;
		this.previousMap.clear();
	};

	private readonly resetState = (): void => {
		this.playermap.clear();
		this.previousMap.clear();
		this.isFirstSnapshot = true;
	};

	/**
	 * Get list of all players
	 */
	public get list(): [number, PlayerData][] {
		return [...this.playermap];
	}

	/**
	 * Get player by ID
	 */
	public getPlayer(client_id: number): PlayerData | null {
		return this.playermap.get(client_id) || null;
	}

	/**
	 * Get number of online players
	 */
	public getPlayerCount(): number {
		return this.playermap.size;
	}

	protected _start(maxclients: number = 64): void {
		this.maxclients = maxclients;
		this.isFirstSnapshot = true;
		this.bot.on('snapshot', this.snapshotlistener);
		this.bot.on('connect', this.resetState);
		this.bot.on('disconnect', this.resetState);
	}

	protected _stop(): void {
		this.bot.off('snapshot', this.snapshotlistener);
		this.bot.off('connect', this.resetState);
		this.bot.off('disconnect', this.resetState);
		this.playermap.clear();
		this.previousMap.clear();
	}

	public on<K extends keyof PlayerListEvents>(event: K, listener: PlayerListEvents[K]): this;
	public on(event: string | symbol, listener: (...args: any[]) => void): this {
		return super.on(event, listener);
	}

	public once<K extends keyof PlayerListEvents>(event: K, listener: PlayerListEvents[K]): this;
	public once(event: string | symbol, listener: (...args: any[]) => void): this {
		return super.once(event, listener);
	}

	public emit<K extends keyof PlayerListEvents>(event: K, ...args: Parameters<PlayerListEvents[K]>): boolean;
	public emit(event: string | symbol, ...args: any[]): boolean {
		return super.emit(event, ...args);
	}

	public off<K extends keyof PlayerListEvents>(event: K, listener: PlayerListEvents[K]): this;
	public off(event: string | symbol, listener: (...args: any[]) => void): this {
		return super.off(event, listener);
	}
}

export default PlayerList;
