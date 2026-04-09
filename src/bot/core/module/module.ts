import { EventEmitter } from 'events';

import type { Bot } from '../core.js';

interface BaseModuleOptions {
	moduleName?: string;
	offonDisconnect?: boolean;
}

class BaseModule<TStartArgs extends unknown[] = []> extends EventEmitter {
	protected readonly bot: Bot;
	public readonly moduleName: string;
	public isRunning: boolean = false;

	private readonly _onDisconnect: () => void;

	constructor(bot: Bot, options: BaseModuleOptions = {}) {
		super();

		const { moduleName = 'Module' } = options;

		if (!bot) {
			throw new Error(`${moduleName} requires bot core`);
		}

		this.bot = bot;
		this.moduleName = moduleName;

		this._onDisconnect = () => this.destroy();
		if (options.offonDisconnect !== false) {
			this.bot.on('disconnect', this._onDisconnect);
		}

		this.bot.on('destroy', () => this.destroy());
	}

	public start(...args: TStartArgs): void {
		if (this.isRunning) return;

		this.isRunning = true;
		this._start(...args);
	}

	public stop(): void {
		if (!this.isRunning) return;

		this.isRunning = false;
		this._stop();
	}

	protected _start(...args: TStartArgs): void {}

	protected _stop(): void {}

	public destroy(): void {
		this.stop();
		this.bot.off('disconnect', this._onDisconnect);
		this.removeAllListeners();
	}
}

export default BaseModule;