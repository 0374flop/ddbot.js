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

    private _inputValues: Partial<Record<InputChannel, number>> = {};
    private _activeChannels: Set<InputChannel> = new Set();

    constructor(bot: Bot, options: InputModuleOptions) {
        super(bot, { offonDisconnect: false, ...options });
        this.channels = options.channels;
        this.priority = options.priority;

        for (const channel of this.channels) {
            this._activeChannels.add(channel);
        }

        this.container?._mixer.register(this);
    }

    public wantsChannel(channel: InputChannel): boolean {
        return this.isRunning && this._activeChannels.has(channel);
    }

    public getInputValue(channel: InputChannel): number {
        return this._inputValues[channel] ?? 0;
    }

    protected setInput(channel: InputChannel, value: number): void {
        if (this.channels.includes(channel)) {
            this._inputValues[channel] = value;
        }
    }

    public claimChannel(channel: InputChannel): void {
        if (this.channels.includes(channel)) {
            this._activeChannels.add(channel);
        }
    }

    public yieldChannel(channel: InputChannel): void {
        this._activeChannels.delete(channel);
    }

    public releaseAll(): void {
        this._activeChannels.clear();
    }

    public claimAll(): void {
        for (const channel of this.channels) {
            this._activeChannels.add(channel);
        }
    }

    public destroy(): void {
        this.container?._mixer.unregister(this);
        super.destroy();
    }
}

export default InputModule;
