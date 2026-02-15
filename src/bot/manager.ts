import { Bot } from './core/core.js';
import { EventEmitter } from 'events';
import * as Types from './types.js';

class BotManager extends EventEmitter {
	private bots: Map<string, Bot> = new Map();
	private names: Set<string> = new Set();

	constructor() {
		super();
	}

	private botevents(id: string, bot: Bot): void {
		bot.on('connect', (data) => {
			this.emit(id + ':connect', data);
		});

		bot.on('disconnect', (reason, data) => {
			this.emit(id + ':disconnect', reason, data);
		});

		bot.on('broadcast', (message) => {
			this.emit(id + ':broadcast', message);
		});

		bot.on('capabilities', (message) => {
			this.emit(id + ':capabilities', message);
		});

		bot.on('emote', (message) => {
			this.emit(id + ':emote', message);
		});

		bot.on('kill', (message) => {
			this.emit(id + ':kill', message);
		});

		bot.on('snapshot', (message) => {
			this.emit(id + ':snapshot', message);
		});

		bot.on('map_change', (message) => {
			this.emit(id + ':map_change', message);
		});

		bot.on('motd', (message) => {
			this.emit(id + ':motd', message);
		});

		bot.on('message', (message) => {
			this.emit(id + ':message', message);
		});

		bot.on('teams', (message) => {
			this.emit(id + ':teams', message);
		});

		bot.on('teamkill', (message) => {
			this.emit(id + ':teamkill', message);
		});

		bot.on('spawn', (message) => {
			this.emit(id + ':spawn', message);
		});

		bot.on('death', (message) => {
			this.emit(id + ':death', message);
		});

		bot.on('hammerhit', (message) => {
			this.emit(id + ':hammerhit', message);
		});

		bot.on('sound_world', (message) => {
			this.emit(id + ':sound_world', message);
		});

		bot.on('explosion', (message) => {
			this.emit(id + ':explosion', message);
		});

		bot.on('common', (message) => {
			this.emit(id + ':common', message);
		});

		bot.on('damage_indicator', (message) => {
			this.emit(id + ':damage_indicator', message);
		});

		bot.on('sound_global', (message) => {
			this.emit(id + ':sound_global', message);
		});
	}

	private createUniqueName(): string {
		const baseName = 'bot_';
		let counter = this.names.size + 1;

		while (this.names.has(baseName + counter)) {
			counter++;
		}

		const uniqueName = baseName + counter;
		this.names.add(uniqueName);
		return uniqueName;
	}

	public createBot(...config: ConstructorParameters<typeof Bot>): string {
		const bot = new Bot(...config);
		const id = this.createUniqueName();
		this.botevents(id, bot);
		this.bots.set(id, bot);
		return id;
	}

	public async removeBotById(id: string): Promise<void> {
		const bot = this.bots.get(id);
		if (bot) {
			await bot.destroy();
			this.bots.delete(id);
		}
	}

	public addBot(bot: Bot): string {
		const id = this.createUniqueName();
		this.bots.set(id, bot);
		return id;
	}

	public getBotById(id: string): Bot | undefined {
		return this.bots.get(id);
	}

	public async disconnectAllBots(): Promise<void> {
		for (const bot of this.bots.values()) {
			try {
				await bot?.disconnect();
			} catch (e) {
				console.error(e);
			}
		}
	}

	public async removeAllBots(): Promise<void> {
		for (const bot of this.bots.values()) {
			try {
				await bot?.destroy();
			} catch (e) {
				console.error(e);
			}
		}
		this.bots.clear();
	}

	public sendinputToAllBots(input: any): void {
		for (const bot of this.bots.values()) {
			try {
				bot?.send_input(input);
			} catch (e) {
				console.error(e);
			}
		}
	}
}

export default BotManager;
