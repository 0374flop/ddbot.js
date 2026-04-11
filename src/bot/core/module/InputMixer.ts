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

        const sortedModules = Array.from(this._modules)
            .filter(m => m.isRunning)
            .sort((a, b) => b.priority - a.priority);

        const filledChannels = new Set<InputChannel>();

        for (const module of sortedModules) {
            for (const channel of module.channels) {
                if (!filledChannels.has(channel) && module.wantsChannel(channel)) {
                    result[channel] = module.getInputValue(channel);
                    filledChannels.add(channel);
                }
            }
        }

        return result;
    }

    public register(module: InputModule) {
        this._modules.add(module);
    }

    public unregister(module: InputModule) {
        this._modules.delete(module);
    }
}
