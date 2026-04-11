import BaseModule from '../core/module/BaseModule.js';
import type { Bot } from '../core/core.js';
import * as Types from '../types.js';

export interface ReconnectingInfo {
	attempt: number;
	delay: number;
	reason: string | null;
	ConnectionInfo: Types.ConnectionInfo;
}

interface ReconnectEvents {
	/** Начинается попытка переподключения */
	reconnecting: (info: ReconnectingInfo) => void;
	/** Успешно переподключились */
	reconnected: (info: { addr: string; port: number }) => void;
	/** Переподключение не удалось (исчерпаны попытки или нет данных о сервере) */
	reconnect_failed: (reason: string | number | unknown) => void;
}

class Reconnect extends BaseModule<[maxAttempts?: number, randomDelay?: boolean]> {
	private maxAttempts: number = -1;
	private randomDelay: boolean = true;
	private currentAttempts: number = 0;
	private reconnecting: boolean = false;
	private reconnectTimer: NodeJS.Timeout | null = null;

	constructor(bot: Bot) {
		super(bot, { moduleName: 'Reconnect' });
	}

	protected _start(maxAttempts: number = -1, randomDelay: boolean = true): void {
		this.maxAttempts = maxAttempts;
		this.randomDelay = randomDelay;
		this.bot.on('disconnect', this.handleDisconnect);
	}

	private handleDisconnect = (reason: string | null, connectionInfo: Types.ConnectionInfo): void => {
		if (reason === null) return;
		if (this.reconnecting) return;

		const addr = connectionInfo.addr;
		const port = connectionInfo.port;

		if (!addr || !port) {
			this.emit('reconnect_failed', 'No connection info');
			return;
		}

		if (this.maxAttempts !== -1 && this.currentAttempts >= this.maxAttempts) {
			this.emit('reconnect_failed', this.currentAttempts);
			return;
		}

		const delay = this.calculateDelay(reason);
		this.reconnecting = true;
		this.currentAttempts++;

		this.emit('reconnecting', {
			attempt: this.currentAttempts,
			delay,
			reason,
			ConnectionInfo: connectionInfo
		});

		this.reconnectTimer = setTimeout(async () => {
			try {
				await this.bot.connect(addr, port, 30000);
				this.currentAttempts = 0;
				this.emit('reconnected', { 
					addr: addr, 
					port: port 
				});
			} catch (err) {
				this.emit('reconnect_failed', err);
			} finally {
				this.reconnecting = false;
			}
		}, delay);
	};

	private calculateDelay(reason: string): number {
		let baseDelay = 10000;

		if (reason.startsWith('You have been banned for 5 minutes')) {
			baseDelay = 300000;
		} else if (reason.startsWith('You have been banned')) {
			baseDelay = 1000000;
		} else if (reason.startsWith('Too many connections')) {
			baseDelay = 20000;
		} else if (reason.startsWith('Timed Out')) {
			baseDelay = 500;
		} else if (reason.startsWith('Only 4 players with the same IP are allowed')) {
			baseDelay = 20000;
		}

		if (this.randomDelay) {
			return baseDelay + Math.random() * 5000;
		}
		return baseDelay;
	}

	protected _stop(): void {
		this.bot.off('disconnect', this.handleDisconnect);
		this.reconnecting = false;
		this.currentAttempts = 0;
		if (this.reconnectTimer) {
			clearTimeout(this.reconnectTimer);
			this.reconnectTimer = null;
		}
	}

	public on<K extends keyof ReconnectEvents>(event: K, listener: ReconnectEvents[K]): this;
	public on(event: string | symbol, listener: (...args: any[]) => void): this {
		return super.on(event, listener);
	}

	public once<K extends keyof ReconnectEvents>(event: K, listener: ReconnectEvents[K]): this;
	public once(event: string | symbol, listener: (...args: any[]) => void): this {
		return super.once(event, listener);
	}

	public emit<K extends keyof ReconnectEvents>(event: K, ...args: Parameters<ReconnectEvents[K]>): boolean;
	public emit(event: string | symbol, ...args: any[]): boolean {
		return super.emit(event, ...args);
	}

	public off<K extends keyof ReconnectEvents>(event: K, listener: ReconnectEvents[K]): this;
	public off(event: string | symbol, listener: (...args: any[]) => void): this {
		return super.off(event, listener);
	}
}

export default Reconnect;
