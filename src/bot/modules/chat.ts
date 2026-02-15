import BaseModule from '../core/module.js';
import type { Bot } from '../core/core.js';
import * as Types from '../types.js';

interface ChatEvents {
	anychat: (msg: Types.SnapshotItemTypes.iMessage, author: string | null, text: string, team: number, client_id: number) => void;
	chat: (msg: Types.SnapshotItemTypes.iMessage, author: string, text: string, team: number, client_id: number) => void;
	systemchat: (msg: Types.SnapshotItemTypes.iMessage, text: string) => void;
	queued: (info: { text: string; team: boolean; queueSize: number }) => void;
	sent: (info: { text: string; team: boolean; queueSize: number }) => void;
}

interface QueuedMessage {
	text: string;
	team: boolean;
}

class Chat extends BaseModule {
	private chatinterval: NodeJS.Timeout | null = null;
	private sendinterval: NodeJS.Timeout | null = null;

	private readonly chatset = new Set<string>();
	private readonly queue: QueuedMessage[] = [];

	private lastSentTime: number = 0;
	private cooldown: number = 1000;

	private readonly chatlistener = (msg: Types.SnapshotItemTypes.iMessage | unknown) => {
		try {
			const msgraw = msg as Types.SnapshotItemTypes.iMessage;
			const text = String(msgraw?.message ?? '');
			const client_id = msgraw.client_id ?? -1;
			const team = msgraw.team ?? 0;

			const autormsg = msgraw?.author?.ClientInfo?.name ?? null;

			const key = `${client_id}:${text}:${team}`;
			if (this.chatset.has(key)) return;
			this.chatset.add(key);

			this.emit('anychat', msgraw, autormsg, text, team, client_id);

			if (autormsg) {
				this.emit('chat', msgraw, autormsg, text, team, client_id);
			} else {
				this.emit('systemchat', msgraw, text);
			}
		} catch (e) {
			console.error(`[${this.moduleName}] chat listener error:`, e);
		}
	};

	constructor(bot: Bot) {
		super(bot, { moduleName: 'Chat' });
	}

	/**
	 * Добавить сообщение в очередь на отправку
	 *
	 * @param text     текст сообщения
	 * @param team     отправить в командный чат? (true = team, false = all)
	 * @param priority добавить в начало очереди (приоритетное сообщение)
	 * @returns true если сообщение добавлено в очередь
	 */
	public send(text: string, team: boolean = false, priority: boolean = false): boolean {
		if (!text || text.trim().length === 0) {
		return false;
		}

		const item: QueuedMessage = { text, team };

		if (priority) {
			this.queue.unshift(item);
		} else {
			this.queue.push(item);
		}

		this.emit('queued', {
			text,
			team,
			queueSize: this.queue.length,
		});

		return true;
	}

	private _processQueue(): void {
		if (this.queue.length === 0) return;

		const now = Date.now();
		if (now - this.lastSentTime < this.cooldown) return;

		const item = this.queue.shift();
		if (!item) return;

		const { text, team } = item;

		if (this.bot.bot_client?.game) {
			this.bot.bot_client.game.Say(text, team);
			this.lastSentTime = now;

			this.emit('sent', {
				text,
				team,
				queueSize: this.queue.length,
			});
		}
	}

	protected _start(interval: number = 1000, cooldown: number = 1000): void {
		this.cooldown = cooldown;

		this.chatinterval = setInterval(() => {
			this.chatset.clear();
		}, interval);

		this.sendinterval = setInterval(() => {
			this._processQueue();
		}, 100);

		this.bot.on('message', this.chatlistener);
	}

	protected _stop(): void {
		this.bot.off('message', this.chatlistener);
		this.chatset.clear();

		if (this.chatinterval) {
			clearInterval(this.chatinterval);
			this.chatinterval = null;
		}

		if (this.sendinterval) {
			clearInterval(this.sendinterval);
			this.sendinterval = null;
		}
	}

	public destroy(): void {
		super.destroy();
	}

	public on<K extends keyof ChatEvents>(event: K, listener: ChatEvents[K]): this;
	public on(event: string | symbol, listener: (...args: any[]) => void): this {
		return super.on(event, listener);
	}

	public once<K extends keyof ChatEvents>(event: K, listener: ChatEvents[K]): this;
	public once(event: string | symbol, listener: (...args: any[]) => void): this {
		return super.once(event, listener);
	}

	public emit<K extends keyof ChatEvents>(event: K, ...args: Parameters<ChatEvents[K]>): boolean;
	public emit(event: string | symbol, ...args: any[]): boolean {
		return super.emit(event, ...args);
	}

	public off<K extends keyof ChatEvents>(event: K, listener: ChatEvents[K]): this;
	public off(event: string | symbol, listener: (...args: any[]) => void): this {
		return super.off(event, listener);
	}
}

export default Chat;