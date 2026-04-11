import InputModule from '../../core/module/InputModule.js';
import type { Bot } from '../../core/core.js';
import type ModuleContainer from '../../core/module/container.js';
import { InputChannel } from '../../core/module/InputMixer.js';

interface FollowOptions {
    container: ModuleContainer;
    priority?: number;
    radius?: number;
}

class Follow extends InputModule<[]> {
    private _targetId: number | null = null;
    private readonly _radius: number;

    private readonly _onSnapshot = (): void => {
        if (this._targetId === null) {
            this.releaseAll();
            return;
        }

        const unpacker = this.bot.bot_client?.SnapshotUnpacker;
        if (!unpacker) return;

        const own = unpacker.getObjCharacter(this.bot.OwnID!);
        const target = unpacker.getObjCharacter(this._targetId);
        if (!own || !target) {
            this.releaseAll();
            return;
        }

        const dx = target.character_core.x - own.character_core.x;
        const dy = target.character_core.y - own.character_core.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > this._radius) {
            this.releaseAll();
            return;
        }

        this.claimAll();
        this.setInput(InputChannel.TargetX, dx);
        this.setInput(InputChannel.TargetY, dy);
    };

    constructor(bot: Bot, options: FollowOptions) {
        super(bot, {
            moduleName: 'Follow',
            channels: [InputChannel.TargetX, InputChannel.TargetY],
            priority: options.priority ?? 50,
            container: options.container
        });
        this._radius = options.radius ?? 300;
    }

    public followPlayer(client_id: number): void {
        this._targetId = client_id;
    }

    public clearTarget(): void {
        this._targetId = null;
        this.releaseAll();
    }

    protected _start(): void {
        this.releaseAll();
        this.bot.on('snapshot', this._onSnapshot);
    }

    protected _stop(): void {
        this.bot.off('snapshot', this._onSnapshot);
        this.clearTarget();
    }
}

export default Follow;
