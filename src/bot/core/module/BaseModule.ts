import { EventEmitter } from 'events';

import type { Bot } from '../core.js';
import ModuleContainer from './container.js';

interface BaseModuleOptions {
	moduleName?: string;
	offonDisconnect?: boolean;
	container?: ModuleContainer;
}

class BaseModule<TStartArgs extends unknown[] = []> extends EventEmitter {
	protected readonly bot: Bot;
	public readonly moduleName: string;
	protected readonly events?: EventEmitter;
	public isRunning: boolean = false;
	private _timers: Set<ReturnType<typeof setTimeout>> = new Set();
	private _intervals: Set<ReturnType<typeof setInterval>> = new Set();

	private readonly _onDisconnect: () => void;

	constructor(bot: Bot, options: BaseModuleOptions = {}) {
		super();

		const { moduleName = 'Module' } = options;

		if (!bot) {
			throw new Error(`${moduleName} requires bot core`);
		}

		this.bot = bot;
		this.moduleName = moduleName;
		this.events = options.container?.events;

		this._onDisconnect = () => this.destroy();
		if (options.offonDisconnect !== false) {
			this.bot.on('disconnect', this._onDisconnect);
		}

		this.bot.on('destroy', () => this.destroy());
	}

	protected get bus(): EventEmitter {
		if (!this.events) {
			throw new Error(`${this.moduleName}: no container provided`);
		}
		return new Proxy(this.events, {
			get: (target, prop) => {
				if (prop === 'emit') {
					return (event: string, ...args: any[]) => target.emit(`${this.moduleName}:${event}`, ...args);
				}
				return (target as any)[prop];
			}
		});
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

	protected setTimeout(fn: () => void, ms: number) {
		const timer = setTimeout(() => {
			fn();
			this._timers.delete(timer);
		}, ms);
		this._timers.add(timer);
	}

	protected setInterval(fn: () => void, ms: number) {
		const interval = setInterval(fn, ms);
		this._intervals.add(interval);
	}

	protected cancelTimeout(timer: ReturnType<typeof setTimeout>) {
		clearTimeout(timer);
		this._timers.delete(timer);
	}

	protected cancelInterval(interval: ReturnType<typeof setInterval>) {
		clearInterval(interval);
		this._intervals.delete(interval);
	}

	private _clearTimers() {
		for (const timer of this._timers) {
			clearTimeout(timer);
		}
		this._timers.clear();
		for (const interval of this._intervals) {
			clearInterval(interval);
		}
		this._intervals.clear();
	}

	public destroy(): void {
		this._clearTimers();
		this.stop();
		this.bot.off('disconnect', this._onDisconnect);
		this.removeAllListeners();
	}
}

export default BaseModule;