import BaseModule from './BaseModule.js';
import type { Bot } from '../core.js';
import type ModuleContainer from './container.js';
import { InputChannel } from './InputMixer.js';

interface InputModuleOptions {
    moduleName?: string;
    offonDisconnect?: boolean;
    container?: ModuleContainer;
    channels: InputChannel[];
    priority: number;
}

class InputModule<TStartArgs extends unknown[] = []> extends BaseModule<TStartArgs> {
    public readonly channels: InputChannel[];
    public readonly priority: number;
    private _activeChannels: Set<InputChannel>;
    private _yieldedChannels: Set<InputChannel> = new Set();
    private _pausedChannels: Set<InputChannel> = new Set();
    private _input: Partial<Record<InputChannel, number>> = {};

    constructor(bot: Bot, options: InputModuleOptions) {
        super(bot, { offonDisconnect: false, ...options });
        this.channels = options.channels;
        this.priority = options.priority;
        this._activeChannels = new Set(options.channels);

        this.container?._mixer.register(this);
    }

    public isChannelActive(channel: InputChannel): boolean {
        return this._activeChannels.has(channel);
    }

    public yieldChannel(channel: InputChannel): void {
        this._yieldedChannels.add(channel);
        this._activeChannels.delete(channel);
    }

    public claimChannel(channel: InputChannel): void {
        this._yieldedChannels.delete(channel);
    }

    public hasYielded(channel: InputChannel): boolean {
        return this._yieldedChannels.has(channel);
    }

    public pauseInput(): void {
        for (const channel of this.channels) {
            if (!this._pausedChannels.has(channel)) {
                this._pausedChannels.add(channel);
                this.yieldChannel(channel);
            }
        }
        this.container?._mixer._recalculate();
        this.emit('input_paused');
    }

    public resumeInput(): void {
        const toResume = [...this._pausedChannels];
        this._pausedChannels.clear();
        for (const channel of toResume) {
            this.claimChannel(channel);
        }
        this.container?._mixer._recalculate();
        this.emit('input_resumed');
    }

    public get isInputPaused(): boolean {
        return this._pausedChannels.size > 0;
    }

    public _mixerPauseChannel(channel: InputChannel): void {
        if (this._activeChannels.has(channel)) {
            this._activeChannels.delete(channel);
            this.emit('channel_paused', channel);
        }
    }

    public _mixerResumeChannel(channel: InputChannel): void {
        if (this.channels.includes(channel) && !this._activeChannels.has(channel)) {
            this._activeChannels.add(channel);
            this.emit('channel_resumed', channel);
        }
    }

    public setInput(channel: InputChannel, value: number): void {
        if (this.channels.includes(channel)) {
            this._input[channel] = value;
        }
    }

    public getInput(channel: InputChannel): number {
        return this._input[channel] ?? 0;
    }

    public waitForChannel(channel: InputChannel): Promise<void> {
        if (this.isChannelActive(channel)) return Promise.resolve();
        return new Promise(resolve => {
            const handler = (ch: InputChannel) => {
                if (ch === channel) {
                    this.off('channel_resumed', handler);
                    resolve();
                }
            };
            this.on('channel_resumed', handler);
        });
    }

    public destroy(): void {
        this.container?._mixer.unregister(this);
        super.destroy();
    }

    public start(...args: TStartArgs): void {
        super.start(...args);
        this.container?._mixer._recalculate();
    }

    public stop(): void {
        super.stop();
        this.container?._mixer._recalculate();
    }
}

export default InputModule;