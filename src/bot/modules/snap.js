const BaseModule = require('./core/module');

class Snap extends BaseModule {
    /**
     * @param {import('../core/core')} bot
     */
    constructor(bot) {
        super(bot, 'Snap');
        this.bot = bot;
        this.hammerHitlistener = (hit) => {
            if (this.areWithinTile(hit.common.x, hit.common.y, this.bot.bot_client.SnapshotUnpacker.getObjCharacter(this.bot.OwnID).character_core.x, this.bot.bot_client.SnapshotUnpacker.getObjCharacter(this.bot.OwnID).character_core.y)) {
                this.emit('hammerhitme', hit);
            }
        };

        this.firelistener = (sound) => {
            const list = this.bot.bot_client.SnapshotUnpacker.AllObjCharacter;
            if (sound.sound_id === 0) this.emit('fire', Snap.whomadesound(sound, list));
        }
    }

    static areWithinTile(x1, y1, x2, y2) {
        const TILE = 32 * 1.1;
        
        const distanceX = Math.abs(x1 - x2);
        const distanceY = Math.abs(y1 - y2);
        
        return distanceX <= TILE && distanceY <= TILE;
    }

    /**
     * 
     * @param {object} sound - sound object
     * @param {Array.<object>} list - character list
     * @returns {number|null} - client_id or null
     */
    static whomadesound(sound, list) {
        for (const character of list) {
            const character_core = character?.character_core;
            if (!character_core) continue;
            if (Snap.areWithinTile(sound.common.x, sound.common.y, character_core.x, character_core.y)) {
                return character.client_id;
            }
        }
        return null;
    }

    static angleshot(character) {
        if (!character || !character.character_core) return null;
        const client_angle = character.character_core.angle;
        const angleRad = (client_angle / 256.0) * Math.PI / 128.0;
        return {
            x: Math.cos(angleRad) * 256,
            y: Math.sin(angleRad) * 256
        };
    }

    _start() {
        this.bot.client.SnapshotUnpacker.on('hammerhit', this.hammerHitlistener);
    }

    _stop() {
        this.bot.client.SnapshotUnpacker.off('hammerhit', this.hammerHitlistener);
    }
}

module.exports = Snap;