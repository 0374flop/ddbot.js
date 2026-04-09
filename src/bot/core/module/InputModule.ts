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
    private _input: Partial<Record<InputChannel, number>> = {};

    constructor(bot: Bot, options: InputModuleOptions) {
        super(bot, options);
        this.channels = options.channels;
        this.priority = options.priority;
        this._activeChannels = new Set(options.channels);

        this.container?._mixer.register(this);
    }

    public isChannelActive(channel: InputChannel): boolean {
        return this._activeChannels.has(channel);
    }

    public pauseChannel(channel: InputChannel): void {
        this._activeChannels.delete(channel);
    }

    public resumeChannel(channel: InputChannel): void {
        if (this.channels.includes(channel)) {
            this._activeChannels.add(channel);
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

    public destroy(): void {
        this.container?._mixer.unregister(this);
        super.destroy();
    }
}

export default InputModule;