import BaseModule from '../core/module.js';
import type { Bot } from '../core/core.js';
import * as Types from '../types.js';

interface HammerHit {
	common: {
		x: number;
		y: number;
	};
	[key: string]: any;
}

interface Sound {
	sound_id: number;
	common: {
		x: number;
		y: number;
	};
	[key: string]: any;
}

interface SnapEvents {
	/** Бота ударили молотком (hammer hit попал в тайл персонажа) */
	hammerhitme: (hit: HammerHit, attackerId: number | null) => void;
	/** Кто-то выстрелил рядом (sound_id === 0) */
	fire: (common: { common: { x: number; y: number } }, nearestClient: number | null) => void;
	/** Персонаж заморожен */
	frozen: () => void;
	/** Персонаж разморожен */
	unfrozen: () => void;
	/** Другой игрок заморожен */
	player_frozen: (client_id: number) => void;
	/** Другой игрок разморожен */
	player_unfrozen: (client_id: number) => void;
}

class Snap extends BaseModule {
	private _isFrozen = false;
	private _playerFreezeState: Map<number, boolean> = new Map();

	private readonly hammerHitlistener = (hit: HammerHit): void => {
		if (this.bot.OwnID === undefined) return;
		const ownCharacter: Types.SnapshotItemTypes.Character = this.bot.bot_client?.SnapshotUnpacker.getObjCharacter(this.bot.OwnID);
		if (!ownCharacter) return;

		if (
			Snap.areWithinTile(
				hit.common.x,
				hit.common.y,
				ownCharacter.character_core.x,
				ownCharacter.character_core.y
			)
		) {
			this.emit(
				'hammerhitme',
				hit,
				Snap.whoareWithinTile(
					hit.common.x,
					hit.common.y,
					this.bot.bot_client?.SnapshotUnpacker.AllObjCharacter || [],
					[this.bot.OwnID]
				)
			);
		}
	};

	private readonly firelistener = (sound: Sound): void => {
		const list = this.bot.bot_client?.SnapshotUnpacker?.AllObjCharacter || [];
		if (sound.sound_id === 0) {
			this.emit('fire', { common: sound.common }, Snap.whoareWithinTile(sound.common.x, sound.common.y, list));
		}
	};

	private readonly snapslistener = (): void => {
		const ffs = () => {
			if (this.bot.OwnID === undefined || !this.bot.bot_client?.SnapshotUnpacker) return;
			const myDDNetChar: Types.SnapshotItemTypes.DDNetCharacter = this.bot.bot_client.SnapshotUnpacker.getObjExDDNetCharacter(this.bot.OwnID);
			if (myDDNetChar) {
				const wasFrozen = this._isFrozen;
				this._isFrozen = myDDNetChar.m_FreezeEnd !== 0;
				if (wasFrozen !== this._isFrozen) {
					this.emit(this._isFrozen ? 'frozen' : 'unfrozen');
				}
			}
		};

		const fps = () => {
			if (!this.bot.bot_client?.SnapshotUnpacker) return;
			const allChars = this.bot.bot_client.SnapshotUnpacker.AllObjCharacter || [];

			const currentIds = new Set<number>();

			for (const char of allChars) {
				if (char.client_id === this.bot.OwnID) continue;

				currentIds.add(char.client_id);

				const ddnetChar: Types.SnapshotItemTypes.DDNetCharacter = this.bot.bot_client.SnapshotUnpacker.getObjExDDNetCharacter(char.client_id);
				if (!ddnetChar) continue;

				const isFrozen = ddnetChar.m_FreezeEnd !== 0;
				const wasFrozen = this._playerFreezeState.get(char.client_id);

				if (wasFrozen === undefined) {
					this._playerFreezeState.set(char.client_id, isFrozen);
					continue;
				}

				if (wasFrozen !== isFrozen) {
					this._playerFreezeState.set(char.client_id, isFrozen);
					this.emit(isFrozen ? 'player_frozen' : 'player_unfrozen', char.client_id);
				}
			}

			for (const id of this._playerFreezeState.keys()) {
				if (!currentIds.has(id)) {
					this._playerFreezeState.delete(id);
				}
			}
		};

		ffs();
		fps();
	};

	constructor(bot: Bot) {
		super(bot, { moduleName: 'Snap', offonDisconnect: false });
	}

	private static areWithinTile(x1: number, y1: number, x2: number, y2: number): boolean {
		const TILE = 32 * 1.1;
		return Math.abs(x1 - x2) <= TILE && Math.abs(y1 - y2) <= TILE;
	}

	private static whoareWithinTile(
		x: number,
		y: number,
		list: Types.SnapshotItemTypes.Character[] = [],
		ignoreClients: number[] = []
	): number | null {
		for (const character of list) {
			const character_core = character?.character_core;
			if (!character_core) continue;
			if (Snap.areWithinTile(x, y, character_core.x, character_core.y)) {
				if (!ignoreClients.includes(character.client_id)) {
					return character.client_id;
				}
			}
		}
		return null;
	}

	public static angleshot(character: Types.SnapshotItemTypes.Character): { x: number; y: number } | null {
		if (!character || !character.character_core) return null;
		const client_angle = character.character_core.angle;
		const angleRad = (client_angle / 256.0) * (Math.PI / 128.0);
		return {
			x: Math.cos(angleRad) * 256,
			y: Math.sin(angleRad) * 256,
		};
	}

	public get isFrozen(): boolean {
		return this._isFrozen;
	}

	public isPlayerFrozen(client_id: number): boolean {
		return this._playerFreezeState.get(client_id) ?? false;
	}

	public lookatplayer(client_id: number): void {
		try {
			const pl_character = this.bot.bot_client?.SnapshotUnpacker.getObjCharacter(client_id);
			const own_character = this.bot.bot_client?.SnapshotUnpacker.getObjCharacter(this.bot.OwnID!);

			if (!pl_character || !own_character) return;

			const angle = Math.atan2(
				pl_character.character_core.y - own_character.character_core.y,
				pl_character.character_core.x - own_character.character_core.x
			);

			this.bot.send_input({ m_TargetX: Math.cos(angle) * 256, m_TargetY: Math.sin(angle) * 256 });
		} catch (e) {
			return;
		}
	}

	protected _start(): void {
		this.bot.on('snapshot', this.snapslistener);
		this.bot.on('hammerhit', this.hammerHitlistener);
		this.bot.on('sound_world', this.firelistener);
	}

	protected _stop(): void {
		this.bot.off('snapshot', this.snapslistener);
		this.bot.off('hammerhit', this.hammerHitlistener);
		this.bot.off('sound_world', this.firelistener);
		this._playerFreezeState.clear();
	}

	public on<K extends keyof SnapEvents>(event: K, listener: SnapEvents[K]): this;
	public on(event: string | symbol, listener: (...args: any[]) => void): this {
		return super.on(event, listener);
	}

	public once<K extends keyof SnapEvents>(event: K, listener: SnapEvents[K]): this;
	public once(event: string | symbol, listener: (...args: any[]) => void): this {
		return super.once(event, listener);
	}

	public emit<K extends keyof SnapEvents>(event: K, ...args: Parameters<SnapEvents[K]>): boolean;
	public emit(event: string | symbol, ...args: any[]): boolean {
		return super.emit(event, ...args);
	}

	public off<K extends keyof SnapEvents>(event: K, listener: SnapEvents[K]): this;
	public off(event: string | symbol, listener: (...args: any[]) => void): this {
		return super.off(event, listener);
	}
}

export default Snap;