import type InputModule from './InputModule.js';
import type * as Types from '../../types.js';

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
    private _owners: Map<InputChannel, InputModule> = new Map();

    public _recalculate() {
        this._owners.clear();

        for (const module of this._modules) {
            if (!module.isRunning) continue;
            for (const channel of module.channels) {
                if (module.hasYielded(channel)) continue;
                const current = this._owners.get(channel);
                if (!current || module.priority > current.priority) {
                    this._owners.set(channel, module);
                }
            }
        }

        for (const module of this._modules) {
            for (const channel of module.channels) {
                if (module.hasYielded(channel)) continue;
                if (this._owners.get(channel) === module) {
                    module._mixerResumeChannel(channel);
                } else {
                    module._mixerPauseChannel(channel);
                }
            }
        }
    }

    public getSnapshot(): Types.SnapshotItemTypes.PlayerInput {
        const result: Types.SnapshotItemTypes.PlayerInput = {
            m_Direction: 0,
            m_TargetX: 0,
            m_TargetY: 0,
            m_Jump: 0,
            m_Fire: 0,
            m_Hook: 0,
            m_PlayerFlags: 0,
            m_WantedWeapon: 0,
            m_NextWeapon: 0,
            m_PrevWeapon: 0,
        };

        for (const [channel, module] of this._owners) {
            result[channel] = module.getInput(channel);
        }

        return result;
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