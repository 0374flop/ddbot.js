import { EventEmitter } from 'events';

import type { Bot } from './core.js';

interface BaseModuleOptions {
	moduleName?: string;
	offonDisconnect?: boolean;
}

	class BaseModule extends EventEmitter {
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
	}

	/**
	 * Запускает модуль, если он ещё не запущен
	 * @param args — аргументы, которые будут переданы в _start
	 */
	public start(...args: unknown[]): void {
		if (this.isRunning) return;

		this.isRunning = true;
		this._start(...args);
	}

	/**
	 * Останавливает модуль, если он запущен
	 */
	public stop(): void {
		if (!this.isRunning) return;

		this.isRunning = false;
		this._stop();
	}

	/**
	 * Метод, который нужно переопределить в наследниках
	 * Здесь происходит основная логика запуска
	 */
	protected _start(...args: unknown[]): void {
		// по умолчанию ничего не делаем
	}

	/**
	 * Метод, который нужно переопределить в наследниках
	 * Здесь происходит очистка при остановке
	 */
	protected _stop(): void {
		// по умолчанию ничего не делаем
	}

	/**
	 * Полная очистка модуля:
	 * - останавливает работу
	 * - снимает обработчик disconnect с bot
	 * - удаляет все слушатели событий самого модуля
	 */
	public destroy(): void {
		this.stop();
		this.bot.off('disconnect', this._onDisconnect);
		this.removeAllListeners();
	}
}

export default BaseModule;