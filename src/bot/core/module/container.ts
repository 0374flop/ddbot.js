import { EventEmitter } from 'events'
import type { Bot } from '../core.js';
import type BaseModule from './BaseModule.js';

export default class ModuleContainer extends EventEmitter {
    public readonly events = new EventEmitter();
    private _modules: Map<Function, BaseModule> = new Map();
    public readonly bot: Bot;

    constructor(Bot: Bot) {
        super();
        this.bot = Bot;
    }

    private _register(cls: Function, instance: BaseModule) {
        if (this._modules.has(cls)) {
            throw new Error(`Module ${cls.name} is already registered.`);
        }
        this._modules.set(cls, instance);
        return instance;
    }

    public registerModule(cls: new (bot: Bot, options?: any) => BaseModule) {
        return this._register(cls, new cls(this.bot, { container: this }));
    }

    public registerModuleFactory<T extends BaseModule>(cls: new (...args: any[]) => T, factory: (bot: Bot) => T) {
        return this._register(cls, factory(this.bot));
    }

    public getModule<T extends BaseModule>(cls: new (...args: any[]) => T): T {
        const module = this._modules.get(cls);
        if (!module) {
            throw new Error(`Module ${cls.name} is not registered.`);
        }
        return module as T;
    }
}