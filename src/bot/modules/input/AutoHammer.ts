import InputModule from '../../core/module/InputModule.js';
import type { Bot } from '../../core/core.js';
import type ModuleContainer from '../../core/module/container.js';
import { InputChannel } from '../../core/module/InputMixer.js';
import PlayerList from '../playerlist.js';

interface AutoHammerOptions {
    container: ModuleContainer;
    priority?: number;
    radius?: number;
}

class AutoHammer extends InputModule<[]> {
    private readonly _radius: number;
    private _lastFire: number = 0;

    private readonly _onSnapshot = (): void => {
        const playerList = this.container?.getModule(PlayerList);
        const unpacker = this.bot.bot_client?.SnapshotUnpacker;
        if (!playerList || !unpacker) {
            this.releaseAll();
            return;
        }

        const own = unpacker.getObjCharacter(this.bot.OwnID!);
        if (!own) {
            this.releaseAll();
            return;
        }

        let targetFound = false;
        for (const [id, data] of playerList.list) {
            if (id === this.bot.OwnID) continue;

            const char = unpacker.getObjCharacter(id);
            if (!char) continue;

            const dx = char.character_core.x - own.character_core.x;
            const dy = char.character_core.y - own.character_core.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist <= this._radius) {
                targetFound = true;
                break;
            }
        }

        if (targetFound) {
            this.claimAll();
            this._lastFire = (this._lastFire + 1) % 256;
            this.setInput(InputChannel.Fire, this._lastFire);
        } else {
            this.releaseAll();
        }
    };

    constructor(bot: Bot, options: AutoHammerOptions) {
        super(bot, {
            moduleName: 'AutoHammer',
            channels: [InputChannel.Fire],
            priority: options.priority ?? 100,
            container: options.container,
            offonDisconnect: false,
        });
        this._radius = options.radius ?? 50;
    }

    protected _start(): void {
        this.releaseAll();
        this.bot.on('snapshot', this._onSnapshot);
    }

    protected _stop(): void {
        this.bot.off('snapshot', this._onSnapshot);
        this.releaseAll();
    }
}

export default AutoHammer;
