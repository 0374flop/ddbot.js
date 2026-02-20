import BaseModule from '../core/module.js';
import type { Bot } from '../core/core.js';
import * as Types from '../types.js';

export interface ReconnectingInfo {
	attempt: number;
	delay: number;
	reason: string | null;
	ConnectionInfo: Types.ConnectionInfo;
}

class Reconnect extends BaseModule {
	private maxAttempts: number = -1;
	private randomDelay: boolean = true;
	private currentAttempts: number = 0;
	private reconnecting: boolean = false;
	private reconnectTimer: NodeJS.Timeout | null = null;

	constructor(bot: Bot) {
		super(bot, { moduleName: 'Reconnect', offonDisconnect: false });
	}

	protected _start(maxAttempts: number = -1, randomDelay: boolean = true): void {
		this.maxAttempts = maxAttempts;
		this.randomDelay = randomDelay;
		this.bot.on('disconnect', this.handleDisconnect);
	}

	private handleDisconnect = (reason: string | null, connectionInfo: Types.ConnectionInfo): void => {
		if (reason === null) return;
		if (this.reconnecting) return;

		if (!connectionInfo.addr || !connectionInfo.port) {
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
				await this.bot.connect(connectionInfo.addr, connectionInfo.port);
				this.currentAttempts = 0;
				this.emit('reconnected', { 
					addr: connectionInfo.addr, 
					port: connectionInfo.port 
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
		}

		if (this.randomDelay) {
			return baseDelay + Math.random() * 1000;
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
}

export default Reconnect;
