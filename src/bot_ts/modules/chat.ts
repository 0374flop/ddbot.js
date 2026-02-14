import BaseModule from '../core/module.js';
import type { Bot, Identity } from '../core/core.js';

interface ChatMessage {
	message?: string | unknown;
	client_id: number;
	team: number;
	author?: {
		ClientInfo?: Identity;
	};
	[key: string]: unknown;
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

	private readonly chatlistener = (msg: ChatMessage | unknown) => {
		try {
			const msgraw = msg as ChatMessage;
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
}

export default Chat;