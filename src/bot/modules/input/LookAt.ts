import InputModule from '../../core/module/InputModule.js';
import type { Bot } from '../../core/core.js';
import type ModuleContainer from '../../core/module/container.js';
import { InputChannel } from '../../core/module/InputMixer.js';

interface LookAtOptions {
    container: ModuleContainer;
    priority?: number;
}

class LookAt extends InputModule<[]> {
    private target: { x: number; y: number } | null = null;

    private _onSnapshot = () => {
        if (!this.target) {
            this.releaseAll();
            return;
        }
        const me = this.bot.bot_client?.SnapshotUnpacker?.getObjCharacter(this.bot.OwnID!);
        if (!me) {
            this.releaseAll();
            return;
        }
        
        this.claimAll();
        const dx = this.target.x - me.character_core.x;
        const dy = this.target.y - me.character_core.y;
        this.setInput(InputChannel.TargetX, dx);
        this.setInput(InputChannel.TargetY, dy);
    }

    constructor(bot: Bot, options: LookAtOptions) {
        super(bot, {
            moduleName: 'LookAt',
            channels: [InputChannel.TargetX, InputChannel.TargetY],
            priority: options.priority ?? 50,
            container: options.container,
            offonDisconnect: false,
        });
    }

    public setTarget(worldX: number, worldY: number): void {
        this.target = { x: worldX, y: worldY };
    }

    public clearTarget(): void {
        this.target = null;
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

export default LookAt;
