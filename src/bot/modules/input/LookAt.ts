import InputModule from './../../core/module/InputModule.js';
import type { Bot } from '../../core/core.js';
import type ModuleContainer from '../../core/module/container.js';
import { InputChannel } from '../../core/module/InputMixer.js';

interface LookAtOptions {
    container: ModuleContainer;
    priority?: number;
}

class LookAt extends InputModule<[]> {
    constructor(bot: Bot, options: LookAtOptions) {
        super(bot, {
            moduleName: 'LookAt',
            channels: [InputChannel.TargetX, InputChannel.TargetY],
            priority: options.priority ?? 50,
            container: options.container,
        });
    }

    public setTarget(worldX: number, worldY: number): void {
        const me = this.bot.bot_client?.SnapshotUnpacker?.getObjCharacter(this.bot.OwnID!);
        if (!me) return;

        this.setInput(InputChannel.TargetX, worldX - me.character_core.x);
        this.setInput(InputChannel.TargetY, worldY - me.character_core.y);
    }

    public clearTarget(): void {
        this.setInput(InputChannel.TargetX, 0);
        this.setInput(InputChannel.TargetY, 0);
    }
}

export default LookAt;