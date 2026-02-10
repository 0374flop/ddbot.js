const Bot = require('./core/core');
const Chat = require('./modules/chat');
const PlayerList = require('./modules/playerlist');

function isHitOnMe(hitX, hitY, myX, myY) {
    const TILE = 32*1.1;
    
    const distanceX = Math.abs(hitX - myX);
    const distanceY = Math.abs(hitY - myY);
    
    return distanceX <= TILE && distanceY <= TILE;
}

(async () => {
    const bot = new Bot({
        name: 'string',
        clan: 'string',
        skin: "string",
        use_custom_color: 1,
        color_body: 1,
        color_feet: 1,
        country: -1,
    });
    const chat = new Chat(bot);
    chat.start();
    const playerlist = new PlayerList(bot);
    playerlist.start();
    await bot.connect('45.141.57.22', 8303, 1222222);
    console.log('подключено')
    const client = bot.bot_client;
    chat.on('anychat', (msgraw, autormsg, text, team, client_id) => {
        console.log(autormsg ? autormsg : 'system', ':', text)
        if (text == 'exit') {
            bot.disconnect();
            setTimeout(() => {
                process.exit();
            }, 100);
        }
    });

    client.SnapshotUnpacker.on('sound_world', (sound) => {
        console.log("Мировой звук:", sound);
        console.log("Тип звука:", sound.sound_id);
        if (sound.sound_id === 0) console.log('Выстрел:', sound.common);
    });

    client.SnapshotUnpacker.on('hammerhit', (hit) => {
        console.log("Удар молотком по объекту:", hit);
        const me = playerlist.getPlayer(bot.OwnID)
        console.log(me.character.character_core.x, me.character.character_core.y);
        if (hit.common.x && hit.common.y) {
            console.log(hit.common.x, hit.common.y, me.character.character_core.x, me.character.character_core.y);
        }

        console.log("Попадание по мне?", isHitOnMe(hit.common.x, hit.common.y, me.character.character_core.x, me.character.character_core.y));
    });

    client.SnapshotUnpacker.on('common', (snapshot) => {
        console.log("Общий снимок:", snapshot);
    });

    setInterval(() => {
        console.log(client?.SnapshotUnpacker?.AllObjExDDNetProjectile);
    }, 50);

    process.stdin.on('data', (data) => {
        client.game.Say(data.toString())
    });

    bot.on('disconnect', (reason, info) => {
        console.log('отключено:', reason, info);
    });

    process.on('SIGINT', async () => {
        await bot.disconnect();
        setTimeout(() => {
            process.exit();
        }, 100);
    });
})().catch((reason) => {
    console.error(reason);
    console.log('завершено');
    process.exit()
});