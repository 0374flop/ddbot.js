import type InputModule from './InputModule.js';

export enum InputChannel {
    Direction = 'm_Direction',
    TargetX = 'm_TargetX',
    TargetY = 'm_TargetY',
    Jump = 'm_Jump',
    Fire = 'm_Fire',
    Hook = 'm_Hook',
    PlayerFlags = 'm_PlayerFlags',
    WantedWeapon = 'm_WantedWeapon',
    NextWeapon = 'm_NextWeapon',
    PrevWeapon = 'm_PrevWeapon'
}

export class InputMixer {
    private _modules: Set<InputModule> = new Set();

    private _recalculate() {
        const owners = new Map<InputChannel, InputModule>();

        for (const module of this._modules) {
            for (const channel of module.channels) {
                const current = owners.get(channel);
                if (!current || module.priority < current.priority) {
                    owners.set(channel, module);
                }
            }
        }

        for (const module of this._modules) {
            for (const channel of module.channels) {
                if (owners.get(channel) === module) {
                    module.resumeChannel(channel);
                } else {
                    module.pauseChannel(channel);
                }
            }
        }
    }

    public register(module: InputModule) {
        this._modules.add(module);
        this._recalculate();
    }

    public unregister(module: InputModule) {
        this._modules.delete(module);
        this._recalculate();
    }
}