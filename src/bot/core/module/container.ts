import { EventEmitter } from 'events'
import type { Bot } from '../core.js';
import type BaseModule from './BaseModule.js';

export default class ModuleContainer extends EventEmitter {
    public readonly events = new EventEmitter();
    private _modules: Map<string, BaseModule> = new Map();
    public readonly bot: Bot;

    constructor(Bot: Bot) {
        super();
        this.bot = Bot;
    }

    private _register(instance: BaseModule) {
        if (this._modules.has(instance.moduleName)) {
            throw new Error(`Module ${instance.moduleName} is already registered.`);
        }
        this._modules.set(instance.moduleName, instance);
        return instance;
    }

    public registerModule(cls: new (bot: Bot) => BaseModule) {
        return this._register(new cls(this.bot));
    }

    public registerModuleFactory(factory: (bot: Bot) => BaseModule) {
        return this._register(factory(this.bot));
    }
}