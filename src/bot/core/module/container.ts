import { EventEmitter } from 'events'
import type { Bot } from '../core.js';
import type BaseModule from './BaseModule.js';
import { InputMixer } from './InputMixer.js';

export default class ModuleContainer {
    public readonly events = new EventEmitter();
    private _modules: Map<Function, BaseModule> = new Map();
    public _mixer: InputMixer;
    public readonly bot: Bot;

    private readonly _onSnapshot: () => void = () => {
        this.bot.send_input(this._mixer.getSnapshot());
    }

    constructor(Bot: Bot) {
        this.bot = Bot;
        this._mixer = new InputMixer();
        this.bot.on('snapshot', this._onSnapshot);
    }

    private _register(cls: Function, instance: BaseModule) {
        if (this._modules.has(cls)) {
            throw new Error(`Module ${cls.name} is already registered.`);
        }
        this._modules.set(cls, instance);
        return instance;
    }

    public registerModule<T extends BaseModule>(
        cls: new (bot: Bot, options?: any) => T,
        options?: Record<string, any> & { autoStart?: boolean }
    ): T {
        const { autoStart = true, ...rest } = options ?? {};
        const instance = this._register(cls, new cls(this.bot, { container: this, ...rest })) as T;
        if (autoStart) instance.start();
        return instance;
    }

    public getModule<T extends BaseModule>(cls: new (...args: any[]) => T): T {
        const module = this._modules.get(cls);
        if (!module) {
            throw new Error(`Module ${cls.name} is not registered.`);
        }
        return module as T;
    }

    public destroy() {
        for (const module of this._modules.values()) {
            module.destroy();
        }
        this.bot.off('snapshot', this._onSnapshot);
        this._modules.clear();
    }
}