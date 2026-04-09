import * as ddbot from './index.js';

const IP = '26.230.124.233';
const PORT = 8303;

const bot = new ddbot.Bot();

const container = new ddbot.ModuleContainer(bot);
const chat = container.registerModule(ddbot.StandardModules.Chat);
const playerList = container.registerModule(ddbot.StandardModules.PlayerList);

const lookAt = container.registerModuleFactory(
    ddbot.InputModules.LookAt,
    (b, c) => new ddbot.InputModules.LookAt(b, { container: c, priority: 10 })
);

const follow = container.registerModuleFactory(
    ddbot.InputModules.Follow,
    (b, c) => new ddbot.InputModules.Follow(b, { container: c, priority: 20 })
);

chat.start();
playerList.start();
lookAt.start();
follow.start();

bot.on('connect', () => {
    console.log('[connect] подключился');

    lookAt.setTarget(700, 1200);

    setTimeout(() => {
        const players = playerList.list.filter(([id]) => id !== bot.OwnID);
        if (players.length > 0) {
            const [targetId, data] = players[0];
            console.log(`${data.clientInfo.name} (id: ${targetId})`);
            follow.followPlayer(targetId);
        }
    }, 100);
    playerList.on('player_joined', ({ client_id, name }) => {
        if (follow['_targetId'] === null) {
            console.log(`${name} (id: ${client_id})`);
            follow.followPlayer(client_id);
        }
    });
});

bot.on('disconnect', (reason) => {
    console.log('disconnect', reason);
});

playerList.on('player_joined', ({ client_id, name }) => {
    console.log(` + ${name} (${client_id})`);
});

playerList.on('player_left', ({ client_id, name }) => {
    console.log(` - ${name} (${client_id})`);
});

(async () => {
    await bot.connect(IP, PORT, 20000);

    process.on('SIGINT', async () => {
        console.log('\nexit');
        container.destroyAll();
        await bot.disconnect();
        process.exit(0);
    });
})();
