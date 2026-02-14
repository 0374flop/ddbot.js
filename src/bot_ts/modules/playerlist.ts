import BaseModule from '../core/module.js';
import type { Bot } from '../core/core.js';

interface PlayerData {
	client_id: number;
	clientInfo: any;
	playerInfo: any;
	character: any | null;
	DDNetCharacter: any | null;
}

class PlayerList extends BaseModule {
	private client: any;
	private maxclients: number = 64;
	private playermap: Map<number, PlayerData> = new Map();
	private previousMap: Map<number, PlayerData> = new Map();

	private readonly snapshotlistener = (): void => {
		this.previousMap = new Map(this.playermap);
		this.playermap.clear();
		if (!this.client) return;

		for (let client_id = 0; client_id < this.maxclients; client_id++) {
			const clientInfo = this.client.SnapshotUnpacker.getObjClientInfo(client_id);
			const playerInfo = this.client.SnapshotUnpacker.getObjPlayerInfo(client_id);
			const character = this.client.SnapshotUnpacker.getObjCharacter(client_id);
			const DDNetCharacter = this.client.SnapshotUnpacker.getObjExDDNetCharacter(client_id);

			if (clientInfo && playerInfo) {
				const playerData: PlayerData = {
					client_id,
					clientInfo,
					playerInfo,
					character: character || null,
					DDNetCharacter: DDNetCharacter || null,
				};
				this.playermap.set(client_id, playerData);

				if (!this.previousMap.has(client_id)) {
					this.emit('player_joined', {
						client_id,
						name: clientInfo.name,
						playerData,
					});
				}
			}
		}

		for (const [client_id, oldData] of this.previousMap) {
			if (!this.playermap.has(client_id)) {
				this.emit('player_left', {
					client_id,
					name: oldData.clientInfo.name,
					playerData: oldData,
				});
			}
		}

		this.previousMap.clear();
	};

	constructor(bot: Bot) {
		super(bot, { moduleName: 'PlayerList' });
		this.client = this.bot.bot_client;
	}

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
		this.bot.on('snapshot', this.snapshotlistener);
	}

	protected _stop(): void {
		this.bot.off('snapshot', this.snapshotlistener);
		this.playermap.clear();
		this.previousMap.clear();
	}
}

export default PlayerList;
