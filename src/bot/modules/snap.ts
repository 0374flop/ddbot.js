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

class Snap extends BaseModule {
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

	constructor(bot: Bot) {
		super(bot, { moduleName: 'Snap' });
	}

	private static areWithinTile(x1: number, y1: number, x2: number, y2: number): boolean {
		const TILE = 32 * 1.1;

		const distanceX = Math.abs(x1 - x2);
		const distanceY = Math.abs(y1 - y2);

		return distanceX <= TILE && distanceY <= TILE;
	}

	private static whoareWithinTile(
		x: number,
		y: number,
		list: any[],
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

	protected _start(): void {
		this.bot.on('hammerhit', this.hammerHitlistener);
		this.bot.on('sound_world', this.firelistener);
	}

	protected _stop(): void {
		this.bot.off('hammerhit', this.hammerHitlistener);
		this.bot.off('sound_world', this.firelistener);
	}
}

export default Snap;
