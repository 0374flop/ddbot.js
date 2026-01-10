const BaseModule = require('../core/module');

class PlayerList extends BaseModule {
    /**
     * @param {import('../core/core')} bot
     */
    constructor(bot) {
        super(bot, 'PlayerList');
        this.client = this.bot.bot_client;

        this.maxclients = 64;
        this.playermap = new Map();
        this.previousMap = new Map();

        this.snapshotlistener = () => {
            this.previousMap = new Map(this.playermap);
            this.playermap.clear();

            for (let client_id = 0; client_id < this.maxclients; client_id++) {
                const clientInfo = this.client.SnapshotUnpacker.getObjClientInfo(client_id);
                const playerInfo = this.client.SnapshotUnpacker.getObjPlayerInfo(client_id);
                const character = this.client.SnapshotUnpacker.getObjCharacter(client_id);
                const DDNetCharacter = this.client.SnapshotUnpacker.getObjExDDNetCharacter(client_id);

                if (clientInfo && playerInfo && character) {
                    const playerData = {
                        client_id,
                        clientInfo,
                        playerInfo,
                        character,
                        DDNetCharacter
                    };
                    this.playermap.set(client_id, playerData);

                    if (!this.previousMap.has(client_id)) {
                        this.emit('player_joined', {
                            client_id,
                            name: clientInfo.name,
                            playerData
                        });
                    }
                }
            }

            for (const [client_id, oldData] of this.previousMap) {
                if (!this.playermap.has(client_id)) {
                    this.emit('player_left', {
                        client_id,
                        name: oldData.clientInfo.name,
                        playerData: oldData
                    });
                }
            }
        };
    }

    /**
     * Получить список всех игроков
     * @returns {Array} [client_id, { client_id, clientInfo, playerInfo, character, DDNetCharacter }]
     */
    get list() {
        return [...this.playermap];
    }

    /**
     * Получить игрока по ID
     * @param {number} client_id
     * @returns {object|null} Данные игрока или null
     */
    getPlayer(client_id) {
        return this.playermap.get(client_id) || null;
    }

    /**
     * Получить количество игроков онлайн
     * @returns {number}
     */
    getPlayerCount() {
        return this.playermap.size;
    }

    /**
     * @param {number} maxclients - Макс клиентов на сервере
     */
    _start(maxclients = 64) {
        this.maxclients = maxclients;
        this.bot.on('snapshot', this.snapshotlistener);
    }

    _stop() {
        this.bot.off('snapshot', this.snapshotlistener);
        this.playermap.clear();
        this.previousMap.clear();
    }
}

module.exports = PlayerList;